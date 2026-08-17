#!/usr/bin/env python3
"""Dump a readable layout spec for a Figma frame: structure, autolayout, colours, text.

Usage: spec.py <screen-name|node-id> [max-depth]
Screen names come from render.py's SCREENS map.
"""
import json, os, sys

D = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, D)
from render import SCREENS  # noqa: E402

_doc = None


def doc():
    global _doc
    if _doc is None:
        _doc = json.load(open(os.path.join(D, 'raw', 'file.json')))['document']
    return _doc


def find(node, nid):
    if node.get('id') == nid:
        return node
    for c in node.get('children') or []:
        r = find(c, nid)
        if r:
            return r
    return None


def hexof(c, opacity=1.0):
    a = c.get('a', 1) * opacity
    r, g, b = (round(c[k] * 255) for k in 'rgb')
    return '#%02x%02x%02x' % (r, g, b) if a >= 0.999 else 'rgba(%d,%d,%d,%.2f)' % (r, g, b, a)


def paint(p):
    if p.get('visible') is False:
        return None
    t = p.get('type')
    if t == 'SOLID':
        return hexof(p['color'], p.get('opacity', 1))
    if t == 'IMAGE':
        return 'image:' + str(p.get('imageRef'))[:8]
    if t and 'GRADIENT' in t:
        return '%s(%s)' % (t.replace('GRADIENT_', '').lower(),
                           ' → '.join(hexof(s['color']) for s in p.get('gradientStops', [])))
    return t


def describe(n, ox, oy):
    """One-line summary of a node's box and paint."""
    bits = []
    b = n.get('absoluteBoundingBox') or {}
    if b:
        bits.append('%dx%d @%d,%d' % (round(b.get('width', 0)), round(b.get('height', 0)),
                                      round(b.get('x', 0) - ox), round(b.get('y', 0) - oy)))
    m = n.get('layoutMode')
    if m and m != 'NONE':
        pad = tuple(round(n.get('padding' + k, 0)) for k in ('Top', 'Right', 'Bottom', 'Left'))
        bits.append('flex-%s gap%g pad%s%s' % (
            'row' if m == 'HORIZONTAL' else 'col', n.get('itemSpacing', 0), str(pad),
            ' ' + n.get('primaryAxisAlignItems', '') if n.get('primaryAxisAlignItems') else ''))
        if n.get('counterAxisAlignItems'):
            bits.append('align:' + n['counterAxisAlignItems'])
    f = [x for x in (paint(p) for p in n.get('fills') or []) if x]
    if f:
        bits.append('bg ' + ','.join(f))
    s = [x for x in (paint(p) for p in n.get('strokes') or []) if x]
    if s:
        bits.append('border %gpx %s' % (n.get('strokeWeight', 1), ','.join(s)))
    r = n.get('cornerRadius') or n.get('rectangleCornerRadii')
    if r:
        bits.append('r' + (str(r) if not isinstance(r, list) else str([round(x) for x in r])))
    for e in n.get('effects') or []:
        if e.get('visible') is not False and e['type'] == 'DROP_SHADOW':
            o = e['offset']
            bits.append('shadow %g %g %g %s' % (o['x'], o['y'], e.get('radius', 0), hexof(e['color'])))
    st = n.get('style')
    if st:
        bits.append('%s %s %gpx/%gpx' % (st.get('fontFamily', ''), st.get('fontWeight', ''),
                                         st.get('fontSize', 0), st.get('lineHeightPx', 0)))
        if st.get('textAlignHorizontal') not in (None, 'LEFT'):
            bits.append(st['textAlignHorizontal'].lower())
    return ' | '.join(bits)


SKIP_NAMES = ('Container', 'Html → Body', 'Frame')


def dump(n, depth, maxd, ox, oy, out):
    pad = '  ' * depth
    name = n.get('name', '')
    if len(name) > 60:
        name = name[:57] + '…'
    line = '%s<%s "%s"> %s' % (pad, n['type'].lower(), name, describe(n, ox, oy))
    if n['type'] == 'TEXT':
        txt = (n.get('characters') or '').replace('\n', ' ⏎ ')
        line += '\n%s  TEXT: %s' % (pad, txt)
    out.append(line)
    if depth >= maxd:
        kids = n.get('children') or []
        if kids:
            out.append('%s  … %d more children' % (pad, len(kids)))
        return
    for c in n.get('children') or []:
        if c.get('visible') is False:
            continue
        dump(c, depth + 1, maxd, ox, oy, out)


def main():
    target = sys.argv[1]
    nid = SCREENS.get(target, target).replace('-', ':')
    maxd = int(sys.argv[2]) if len(sys.argv) > 2 else 99
    n = find(doc(), nid)
    if not n:
        sys.exit('node %s not found' % nid)
    b = n.get('absoluteBoundingBox') or {'x': 0, 'y': 0}
    out = []
    dump(n, 0, maxd, b['x'], b['y'], out)
    print('\n'.join(out))


if __name__ == '__main__':
    main()

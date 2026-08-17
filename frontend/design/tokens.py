#!/usr/bin/env python3
"""Summarise the colours, type styles, radii and effects used across the Figma file."""
import json, collections, os

D = os.path.dirname(__file__)
doc = json.load(open(os.path.join(D, 'raw', 'file.json')))['document']


def hexof(c, opacity=1.0):
    a = c.get('a', 1) * opacity
    r, g, b = (round(c[k] * 255) for k in 'rgb')
    if a >= 0.999:
        return '#%02x%02x%02x' % (r, g, b)
    return 'rgba(%d,%d,%d,%.2f)' % (r, g, b, a)


fills = collections.Counter()
strokes = collections.Counter()
texts = collections.Counter()
radii = collections.Counter()
shadows = collections.Counter()
fonts = collections.Counter()


def walk(n):
    for f in n.get('fills') or []:
        if f.get('visible') is not False and f.get('type') == 'SOLID':
            key = hexof(f['color'], f.get('opacity', 1))
            (texts if n['type'] == 'TEXT' else fills)[key] += 1
        elif f.get('visible') is not False and 'GRADIENT' in f.get('type', ''):
            stops = '→'.join(hexof(s['color']) for s in f.get('gradientStops', []))
            fills['grad(%s %s)' % (f['type'].replace('GRADIENT_', '').lower(), stops)] += 1
    for s in n.get('strokes') or []:
        if s.get('visible') is not False and s.get('type') == 'SOLID':
            strokes['%s %spx' % (hexof(s['color'], s.get('opacity', 1)), n.get('strokeWeight', 1))] += 1
    if n.get('cornerRadius') is not None:
        radii[n['cornerRadius']] += 1
    elif n.get('rectangleCornerRadii'):
        radii[tuple(n['rectangleCornerRadii'])] += 1
    for e in n.get('effects') or []:
        if e.get('visible') is not False and e['type'] in ('DROP_SHADOW', 'INNER_SHADOW'):
            o = e['offset']
            shadows['%s %gpx %gpx %gpx %s' % (e['type'].split('_')[0].lower(), o['x'], o['y'],
                                              e.get('radius', 0), hexof(e['color']))] += 1
    st = n.get('style')
    if st:
        fonts['%s / %s / %spx / lh %.0f / ls %.2f' % (
            st.get('fontFamily'), st.get('fontWeight'), st.get('fontSize'),
            st.get('lineHeightPx', 0), st.get('letterSpacing', 0))] += 1
    for c in n.get('children') or []:
        walk(c)


walk(doc)


def dump(title, counter, n=40):
    print('\n== %s (%d distinct) ==' % (title, len(counter)))
    for k, v in counter.most_common(n):
        print('%6d  %s' % (v, k))


dump('TEXT COLOURS', texts)
dump('FILL COLOURS', fills)
dump('STROKES', strokes, 25)
dump('TYPE STYLES', fonts, 45)
dump('RADII', radii, 20)
dump('SHADOWS', shadows, 20)

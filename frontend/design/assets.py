#!/usr/bin/env python3
"""Download every image fill used in the Figma file into public/img/<ref>.<ext>."""
import json, os, urllib.request, collections

D = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(D)
TOKEN = open(os.path.join(ROOT, '.env.figma')).read().split('=', 1)[1].strip()
KEY = 'dgGOEHdB3yYVkFFe3VOTvk'
OUT = os.path.join(ROOT, 'public', 'img')

SIG = {b'\x89PNG': 'png', b'\xff\xd8\xff': 'jpg', b'GIF8': 'gif', b'RIFF': 'webp'}


def ext_of(head):
    for sig, e in SIG.items():
        if head.startswith(sig):
            return e
    return 'png'


def main():
    doc = json.load(open(os.path.join(D, 'raw', 'file.json')))['document']
    used = collections.Counter()

    def walk(n):
        for f in (n.get('fills') or []) + (n.get('strokes') or []):
            if f.get('type') == 'IMAGE' and f.get('imageRef'):
                used[f['imageRef']] += 1
        for c in n.get('children') or []:
            walk(c)

    walk(doc)
    print('%d distinct image fills' % len(used))

    req = urllib.request.Request('https://api.figma.com/v1/files/%s/images' % KEY,
                                 headers={'X-Figma-Token': TOKEN})
    with urllib.request.urlopen(req) as r:
        urls = json.load(r)['meta']['images']

    os.makedirs(OUT, exist_ok=True)
    for ref, count in used.most_common():
        url = urls.get(ref)
        if not url:
            print('MISS', ref)
            continue
        if any(os.path.exists(os.path.join(OUT, ref + '.' + e)) for e in SIG.values()):
            continue
        data = urllib.request.urlopen(url).read()
        path = os.path.join(OUT, ref + '.' + ext_of(data[:4]))
        with open(path, 'wb') as f:
            f.write(data)
        print('%-42s x%-3d %8d bytes  %s' % (ref, count, len(data), os.path.basename(path)))


if __name__ == '__main__':
    main()

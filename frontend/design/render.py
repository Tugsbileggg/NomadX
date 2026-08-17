#!/usr/bin/env python3
"""Render Figma frames to PNG via the REST images endpoint."""
import json, os, sys, urllib.request, urllib.parse, time

TOKEN = open(os.path.join(os.path.dirname(__file__), '..', '.env.figma')).read().split('=', 1)[1].strip()
KEY = 'dgGOEHdB3yYVkFFe3VOTvk'
OUT = os.path.join(os.path.dirname(__file__), 'shots')

SCREENS = {
    # public + auth
    'home': '21:925',
    'auth-login': '21:845',
    'auth-register': '76:386',
    'auth-forgot': '76:560',
    'auth-reset': '76:516',
    'auth-otp': '76:36',
    'auth-success': '76:80',
    # business registration wizard
    'reg-step1-type': '21:1291',
    'reg-step2-info': '21:1360',
    'reg-step3-docs': '21:1511',
    'reg-step4-contract': '21:1634',
    'reg-step5-review': '21:1764',
    # super admin
    'sa-dashboard': '72:339',
    'sa-users': '72:3998',
    'sa-salons': '72:3566',
    'sa-bookings': '72:3155',
    'sa-transactions': '72:2596',
    'sa-complaints': '72:1587',
    'sa-reviews': '72:1236',
    'sa-ai-usage': '72:899',
    'sa-settings': '72:733',
    'sa-modal-a': '82:2891',
    'sa-modal-b': '84:3152',
    'sa-modal-c': '82:1918',
    'sa-modal-d': '79:694',
    # business (salon) admin
    'ba-analytics': '54:747',
    'ba-bookings': '54:1116',
    'ba-booking-new': '54:2495',
    'ba-calendar': '56:3832',
    'ba-availability': '56:4045',
    'ba-services': '61:2',
    'ba-services-alt': '54:2219',
    'ba-employees': '54:2722',
    'ba-customers': '54:1710',
    'ba-reviews': '54:1905',
    'ba-settings': '54:3281',
    'ba-modal-a': '84:3305',
    # artist (solo) admin
    'ar-profile': '87:3565',
    'ar-dashboard': '87:3802',
    'ar-dashboard-2': '87:4208',
    'ar-bookings': '87:4681',
    'ar-calendar': '87:4948',
    'ar-clients': '87:5163',
    'ar-services': '87:5429',
    'ar-analytics': '87:5711',
    'ar-reviews': '87:6045',
    'ar-messages': '87:6306',
    'ar-settings': '87:6487',
    'ar-modal-a': '87:6747',
    'ar-extra': '91:6925',
    # drawer overlay
    'drawer': '82:2418',
}


def api(path):
    req = urllib.request.Request('https://api.figma.com/v1/' + path,
                                 headers={'X-Figma-Token': TOKEN})
    with urllib.request.urlopen(req) as r:
        return json.load(r)


def main():
    names = sys.argv[1:] or list(SCREENS)
    os.makedirs(OUT, exist_ok=True)
    todo = [n for n in names if not os.path.exists(os.path.join(OUT, n + '.png'))]
    for i in range(0, len(todo), 8):
        batch = todo[i:i + 8]
        ids = ','.join(SCREENS[n] for n in batch)
        res = api('images/%s?ids=%s&format=png&scale=1' % (KEY, urllib.parse.quote(ids)))
        for n in batch:
            url = res['images'].get(SCREENS[n].replace('-', ':'))
            if not url:
                print('MISS', n, res.get('err'))
                continue
            dest = os.path.join(OUT, n + '.png')
            urllib.request.urlretrieve(url, dest)
            print('%-18s %7d bytes' % (n, os.path.getsize(dest)))
        time.sleep(0.4)


if __name__ == '__main__':
    main()

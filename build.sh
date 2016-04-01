#/bin/sh

python kango/kango.py build ./

rm update.zip

cp certificates/chrome.pem output/chrome/key.pem

cd output/chrome/
zip -r ./update.zip .
cd -

rm output/chrome/key.pem
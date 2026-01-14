cd ./website

npm install
npm run build
npm run deploy

git add .
git commit -m "Deploy updated website"
git push origin main
# 기능사 노트

기능사 필기시험 학습용 React/Vite 정적 웹 앱입니다.

## GitHub Pages 배포

저장소의 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 설정합니다. 이후 `main` 브랜치에 push하면 GitHub Actions가 사이트를 빌드해 배포합니다.

배포 주소: <https://202620912-svg.github.io/test/>

## 로컬 개발

```bash
npm ci
npm run dev
```

## 문제 데이터

앱에서 등록한 문제와 학습 기록은 현재 브라우저의 `localStorage`에 저장됩니다. 따라서 같은 배포 사이트를 이용해도 브라우저·기기 간 데이터는 공유되지 않습니다.

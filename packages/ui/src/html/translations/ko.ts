import { registerTranslation, type LuxenTranslation } from '../shared/localize.js';

const ko: LuxenTranslation = {
  $code: 'ko',
  $name: '한국어',
  $dir: 'ltr',

  loading: '로딩 중',
  close: '닫기',

  previousSlide: '이전 슬라이드',
  nextSlide: '다음 슬라이드',
  toggleFullscreen: '전체 화면 전환',
  goToSlide: (n) => `${n}번 슬라이드로 이동`,

  showPassword: '비밀번호 표시',

  increaseValue: '값 늘리기',
  decreaseValue: '값 줄이기',

  rangeMinimum: '최솟값',
  rangeMaximum: '최댓값',

  clear: '지우기',
  noResults: '결과 없음',
  selectOption: '옵션을 선택하세요.',
  suggestions: '제안',
  search: '검색',

  remove: '제거',

  richTextEditor: '서식 있는 텍스트 편집기',
  formatting: '서식',
  heading1: '제목 1',
  heading2: '제목 2',
  heading3: '제목 3',
  bold: '굵게',
  italic: '기울임꼴',
  underline: '밑줄',
  strikethrough: '취소선',
  highlight: '형광펜',
  bulletList: '글머리 기호 목록',
  orderedList: '번호 매기기 목록',
  blockquote: '인용구',
  codeBlock: '코드 블록',
  horizontalRule: '가로줄',
  link: '링크',
  emoji: '이모지',
  attachFile: '파일 첨부',
  undo: '실행 취소',
  redo: '다시 실행',

  stories: '스토리',
  storyProgress: '스토리 진행률',
  previousStory: '이전 스토리',
  nextStory: '다음 스토리',
  mute: '음소거',
  unmute: '음소거 해제',
};

registerTranslation(ko);

export default ko;

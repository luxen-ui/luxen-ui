import { registerTranslation, type LuxenTranslation } from '../shared/localize.js';

const fr: LuxenTranslation = {
  $code: 'fr',
  $name: 'Français',
  $dir: 'ltr',

  loading: 'Chargement',
  close: 'Fermer',

  previousSlide: 'Diapositive précédente',
  nextSlide: 'Diapositive suivante',
  toggleFullscreen: 'Basculer en plein écran',
  goToSlide: (n) => `Aller à la diapositive ${n}`,

  showPassword: 'Afficher le mot de passe',

  increaseValue: 'Augmenter la valeur',
  decreaseValue: 'Diminuer la valeur',

  richTextEditor: 'Éditeur de texte enrichi',
  formatting: 'Mise en forme',
  heading1: 'Titre 1',
  heading2: 'Titre 2',
  heading3: 'Titre 3',
  bold: 'Gras',
  italic: 'Italique',
  underline: 'Souligné',
  strikethrough: 'Barré',
  highlight: 'Surligner',
  bulletList: 'Liste à puces',
  orderedList: 'Liste numérotée',
  blockquote: 'Citation',
  codeBlock: 'Bloc de code',
  horizontalRule: 'Trait horizontal',
  link: 'Lien',
  emoji: 'Émoji',
  attachFile: 'Joindre un fichier',
  undo: 'Annuler',
  redo: 'Rétablir',

  stories: 'Stories',
  storyProgress: 'Progression de la story',
  previousStory: 'Story précédente',
  nextStory: 'Story suivante',
  mute: 'Couper le son',
  unmute: 'Activer le son',
};

registerTranslation(fr);

export default fr;

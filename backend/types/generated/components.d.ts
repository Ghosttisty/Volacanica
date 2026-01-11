import type { Schema, Struct } from '@strapi/strapi';

export interface AnimationPartsOverlayText extends Struct.ComponentSchema {
  collectionName: 'components_animation_parts_overlay_texts';
  info: {
    displayName: 'OverlayText';
    icon: 'stack';
  };
  attributes: {
    endAt: Schema.Attribute.Integer;
    startAt: Schema.Attribute.Integer;
    text: Schema.Attribute.Text;
  };
}

export interface MenuPartsMenuItem extends Struct.ComponentSchema {
  collectionName: 'components_menu_parts_menu_items';
  info: {
    displayName: 'MenuItem';
    icon: 'crown';
  };
  attributes: {
    decorativeShapes: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
    description: Schema.Attribute.Text;
    media: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    mediaSequence: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
    name: Schema.Attribute.String;
    price: Schema.Attribute.String;
    scrollDuration: Schema.Attribute.Integer;
  };
}

export interface ScenesSceneHistory extends Struct.ComponentSchema {
  collectionName: 'components_scenes_scene_histories';
  info: {
    displayName: 'SceneHistory';
    icon: 'stack';
  };
  attributes: {
    collageImages: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
    decorativeShapes: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
    textGroups: Schema.Attribute.Component<'story-parts.text-group', true>;
    title: Schema.Attribute.String;
  };
}

export interface ScenesSceneImageSequence extends Struct.ComponentSchema {
  collectionName: 'components_scenes_scene_image_sequences';
  info: {
    displayName: 'SceneImageSequence';
    icon: 'stack';
  };
  attributes: {
    frames: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
    overlayTexts: Schema.Attribute.Component<
      'animation-parts.overlay-text',
      true
    >;
    scrollDuration: Schema.Attribute.Integer;
  };
}

export interface ScenesSceneMenu extends Struct.ComponentSchema {
  collectionName: 'components_scenes_scene_menus';
  info: {
    displayName: 'SceneMenu';
    icon: 'stack';
  };
  attributes: {
    floatingIngredients: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
    menuItems: Schema.Attribute.Component<'menu-parts.menu-item', true>;
    title: Schema.Attribute.String;
  };
}

export interface ScenesSceneReservationForm extends Struct.ComponentSchema {
  collectionName: 'components_scenes_scene_reservation_forms';
  info: {
    displayName: 'SceneReservationForm';
    icon: 'stack';
  };
  attributes: {
    buttonText: Schema.Attribute.String;
    phoneNumber: Schema.Attribute.String;
    reservationLink: Schema.Attribute.String;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface ScenesSceneVideoScrub extends Struct.ComponentSchema {
  collectionName: 'components_scenes_scene_video_scrubs';
  info: {
    displayName: 'SceneVideoScrub';
    icon: 'stack';
  };
  attributes: {
    overlayTexts: Schema.Attribute.Component<
      'animation-parts.overlay-text',
      true
    >;
    scrollDuration: Schema.Attribute.Integer;
    video: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
  };
}

export interface StoryPartsTextGroup extends Struct.ComponentSchema {
  collectionName: 'components_story_parts_text_groups';
  info: {
    displayName: 'TextGroup';
    icon: 'oneToMany';
  };
  attributes: {
    animation_type: Schema.Attribute.Enumeration<
      [
        'default-fade-in',
        'nice-group-entry',
        'icon-hand-float',
        'typewriter',
        'huge-pop',
        'super-group',
        'choreograph-group',
      ]
    >;
    icon: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    text_1: Schema.Attribute.String;
    text_2: Schema.Attribute.String;
    text_3: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'animation-parts.overlay-text': AnimationPartsOverlayText;
      'menu-parts.menu-item': MenuPartsMenuItem;
      'scenes.scene-history': ScenesSceneHistory;
      'scenes.scene-image-sequence': ScenesSceneImageSequence;
      'scenes.scene-menu': ScenesSceneMenu;
      'scenes.scene-reservation-form': ScenesSceneReservationForm;
      'scenes.scene-video-scrub': ScenesSceneVideoScrub;
      'story-parts.text-group': StoryPartsTextGroup;
    }
  }
}

// @ts-check

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.

 @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
  // Manual sidebar for the AI/Spec-Driven textbook
  textbookSidebar: [
    {
      type: 'category',
      label: 'AI/Spec-Driven Book on Physical AI & Humanoid Robotics',
      collapsed: false,
      items: [
        // Core chapters (1-9)
        'chapter1_introduction',
        'chapter2_ai_fundamentals',
        'chapter3_spec_driven_methodology',
        'chapter4_advanced_topics',
        'chapter5_practical_applications',
        'chapter6_case_studies',
        'chapter7_examples',
        'chapter8_best_practices',
        'chapter9_conclusion',
        // Optional chapters
        'optional_personalization',
        'optional_urdu_translation',
        'optional_extended_interaction'
      ]
    }
  ]
};

export default sidebars;

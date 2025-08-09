

import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import json from '@eslint/json';
import markdown from '@eslint/markdown';
import css from '@eslint/css';
import { defineConfig } from 'eslint/config';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier'; // 新增导入

export default defineConfig([
  {
    files: ['**/*.{js,jsx,ts,tsx,json,md,css}'],
    plugins: { prettier: prettierPlugin },
    rules: {
      'prettier/prettier': 'error',
      // 关闭与 Prettier 冲突的规则
      ...prettierConfig.rules, // 修改此处
    },
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    plugins: { js },
    extends: ['js/recommended'],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  tseslint.configs.recommended,
  // pluginReact.configs.flat.recommended,
  {
    // 明确仅对 .jsx 和 .tsx 文件应用 React 规则
    files: ['**/*.{jsx,tsx}'],
    plugins: { react: pluginReact },
    settings: {
      react: {
        version: 'detect', // 自动检测 React 版本
      },
    },
    extends: [pluginReact.configs.flat.recommended],
  },
  {
    files: ['**/*.json'],
    plugins: { json },
    language: 'json/json',
    extends: ['json/recommended'],
  },
  {
    files: ['**/*.md'],
    plugins: { markdown },
    language: 'markdown/commonmark',
    extends: ['markdown/recommended'],
  },
  {
    files: ['**/*.css'],
    plugins: { css },
    language: 'css/css',
    extends: ['css/recommended'],
  },
]);

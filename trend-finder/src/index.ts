#!/usr/bin/env node
/**
 * エントリーポイント
 */

// 環境変数を読み込み
import dotenv from 'dotenv';
dotenv.config();

import { program } from './cli.js';

// プログラム実行
program.parse(process.argv);

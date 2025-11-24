/**
 * CLI定義
 */

import { Command } from 'commander';
import fs from 'fs/promises';
import path from 'path';
import { TrendService } from './services/index.js';
import { logger } from './utils/logger.js';
import { config } from './config/index.js';

const program = new Command();
const trendService = new TrendService();

program
  .name('trend-finder')
  .description('トレンド分析・コンテンツ提案システム')
  .version('1.0.0');

// collect コマンド
program
  .command('collect')
  .description('トレンドデータを収集')
  .option('--save', 'データを保存する')
  .action(async (options) => {
    try {
      logger.info('Starting trend collection...');
      const trends = await trendService.collectAllTrends();

      console.log(`\n✅ ${trends.length}件のトレンドを収集しました\n`);

      // 上位5件を表示
      console.log('📊 トップトレンド（上位5件）:');
      trends.slice(0, 5).forEach((trend, index) => {
        console.log(`  ${index + 1}. ${trend.keyword} (スコア: ${trend.score})`);
      });

      if (options.save) {
        await trendService.saveTrends(trends);
        console.log('\n💾 データを保存しました');
      }
    } catch (error) {
      logger.error('Failed to collect trends', error);
      console.error('❌ エラーが発生しました:', error);
      process.exit(1);
    }
  });

// analyze コマンド
program
  .command('analyze')
  .description('トレンドを分析')
  .option('--date <date>', '対象日付 (YYYY-MM-DD)')
  .action(async (_options) => {
    try {
      logger.info('Starting trend analysis...');

      let trends = await trendService.collectAllTrends();
      const analyzedTrends = await trendService.analyzeTrends(trends);

      console.log(`\n✅ ${analyzedTrends.length}件のトレンドを分析しました\n`);

      // 急上昇トレンド
      const risingTrends = trendService.detectRisingTrends(analyzedTrends);
      console.log(`📈 急上昇トレンド: ${risingTrends.length}件`);
      risingTrends.slice(0, 3).forEach((trend) => {
        console.log(`  - ${trend.keyword} (スコア: ${trend.score})`);
      });

      console.log(`\n💾 データを保存しました`);
      await trendService.saveTrends(analyzedTrends);
    } catch (error) {
      logger.error('Failed to analyze trends', error);
      console.error('❌ エラーが発生しました:', error);
      process.exit(1);
    }
  });

// report コマンド
program
  .command('report')
  .description('日次レポートを生成（Markdown + HTMLダッシュボード）')
  .option('--output <dir>', '出力ディレクトリ', './data/reports/daily')
  .action(async (options) => {
    try {
      logger.info('Generating daily report...');

      // Markdownレポート生成
      const markdownReport = await trendService.generateDailyReport();

      // HTMLダッシュボード生成
      const htmlReport = await trendService.generateDailyReportHTML();

      // 出力ディレクトリを作成
      await fs.mkdir(options.output, { recursive: true });

      // ファイルに保存
      const today = new Date().toISOString().split('T')[0];
      const mdFilename = `${today}.md`;
      const htmlFilename = `${today}.html`;
      const mdFilepath = path.join(options.output, mdFilename);
      const htmlFilepath = path.join(options.output, htmlFilename);

      await fs.writeFile(mdFilepath, markdownReport, 'utf-8');
      await fs.writeFile(htmlFilepath, htmlReport, 'utf-8');

      console.log(`\n✅ 日次レポートを生成しました`);
      console.log(`📄 Markdown: ${mdFilepath}`);
      console.log(`🌐 HTMLダッシュボード: ${htmlFilepath}\n`);

      // Markdownレポートの一部を表示
      const lines = markdownReport.split('\n');
      console.log(lines.slice(0, 20).join('\n'));
      console.log('\n...\n');

      // HTMLダッシュボードをブラウザで開く案内
      console.log('💡 HTMLダッシュボードを開くには:');
      console.log(`   open ${htmlFilepath}\n`);
    } catch (error) {
      logger.error('Failed to generate report', error);
      console.error('❌ エラーが発生しました:', error);
      process.exit(1);
    }
  });

// info コマンド
program
  .command('info')
  .description('システム情報を表示')
  .action(() => {
    console.log('\n📊 トレンドファインダー システム情報\n');
    console.log(`バージョン: 1.0.0`);
    console.log(`データパス: ${config.storage.path}`);
    console.log(`ログレベル: ${config.logging.level}`);
    console.log(`ログファイル: ${config.logging.file}\n`);
  });

export { program };

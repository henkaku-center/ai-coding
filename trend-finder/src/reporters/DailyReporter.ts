/**
 * DailyReporter
 * 日次レポート生成
 */

import { format } from 'date-fns';
import { Trend } from '../models/Trend.js';
import { ArticleProposal } from '../models/ArticleProposal.js';
import { BookPromotion } from '../models/BookPromotion.js';
import { CATEGORY_LABELS } from '../config/categories.js';
import { logger } from '../utils/logger.js';

export interface DailyReportData {
  date: Date;
  topTrends: Trend[];
  risingTrends: Trend[];
  articleProposals: ArticleProposal[];
  bookPromotions: BookPromotion[];
}

export class DailyReporter {
  /**
   * 日次レポートを生成（Markdown形式）
   */
  generateMarkdown(data: DailyReportData): string {
    logger.info('Generating daily report in Markdown format');

    const dateStr = format(data.date, 'yyyy年MM月dd日');
    const lines: string[] = [];

    // ヘッダー
    lines.push(`# トレンドレポート - ${dateStr}`);
    lines.push('');

    // トップトレンド
    lines.push('## 🔥 トップトレンド');
    lines.push('');

    if (data.topTrends.length > 0) {
      data.topTrends.slice(0, 10).forEach((trend, index) => {
        lines.push(`### ${index + 1}. ${trend.keyword}`);
        lines.push(`- **スコア**: ${trend.score}/100`);
        lines.push(`- **カテゴリ**: ${CATEGORY_LABELS[trend.category]}`);
        lines.push(`- **メンション数**: ${trend.mentionCount.toLocaleString()}件`);
        lines.push(`- **ソース**: ${trend.source}`);

        if (trend.metadata.hashtags && trend.metadata.hashtags.length > 0) {
          lines.push(`- **関連ハッシュタグ**: ${trend.metadata.hashtags.join(', ')}`);
        }

        lines.push('');
      });
    } else {
      lines.push('トレンドデータがありません。');
      lines.push('');
    }

    // 急上昇ワード
    lines.push('## 📈 急上昇ワード');
    lines.push('');

    if (data.risingTrends.length > 0) {
      data.risingTrends.forEach((trend) => {
        lines.push(`- **${trend.keyword}** (スコア: ${trend.score})`);
      });
      lines.push('');
    } else {
      lines.push('急上昇中のトレンドはありません。');
      lines.push('');
    }

    // おすすめ記事テーマ
    lines.push('## ✍️ おすすめ記事テーマ');
    lines.push('');

    if (data.articleProposals.length > 0) {
      data.articleProposals.forEach((proposal, index) => {
        lines.push(`### ${index + 1}. ${proposal.title}`);
        lines.push(`- **切り口**: ${proposal.angle}`);
        lines.push(`- **想定読者**: ${proposal.targetAudience}`);
        lines.push(
          `- **推奨公開**: ${format(proposal.recommendedPublishTime, 'MM月dd日 HH:mm')}`
        );
        lines.push(`- **理由**: ${proposal.reason}`);
        lines.push('');
      });
    } else {
      lines.push('記事提案がありません。');
      lines.push('');
    }

    // 書籍プロモーション推奨
    lines.push('## 📚 書籍プロモーション推奨');
    lines.push('');

    if (data.bookPromotions.length > 0) {
      // 推奨度別に分類
      const high = data.bookPromotions.filter((p) => p.recommendationLevel === 'high');
      const medium = data.bookPromotions.filter((p) => p.recommendationLevel === 'medium');
      const low = data.bookPromotions.filter((p) => p.recommendationLevel === 'low');

      if (high.length > 0) {
        lines.push('### 🔴 高推奨');
        high.forEach((promo) => {
          lines.push(`#### ${promo.book.title}`);
          lines.push(`- **Amazon**: ${promo.book.amazonUrl}`);
          lines.push(`- **理由**: ${promo.reason}`);
          lines.push(
            `- **推奨期間**: ${format(promo.recommendedPeriod.start, 'MM/dd')} - ${format(promo.recommendedPeriod.end, 'MM/dd')}`
          );
          lines.push('');
        });
      }

      if (medium.length > 0) {
        lines.push('### 🟡 中推奨');
        medium.forEach((promo) => {
          lines.push(`#### ${promo.book.title}`);
          lines.push(`- **Amazon**: ${promo.book.amazonUrl}`);
          lines.push(`- **理由**: ${promo.reason}`);
          lines.push('');
        });
      }

      if (low.length > 0) {
        lines.push('### 🟢 低推奨');
        low.forEach((promo) => {
          lines.push(`- ${promo.book.title} - [Amazon](${promo.book.amazonUrl})`);
        });
        lines.push('');
      }
    } else {
      lines.push('書籍プロモーション推奨はありません。');
      lines.push('');
    }

    // フッター
    lines.push('---');
    lines.push(`レポート生成日時: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`);
    lines.push('');

    return lines.join('\n');
  }

  /**
   * 日次レポートを生成（JSON形式）
   */
  generateJSON(data: DailyReportData): string {
    logger.info('Generating daily report in JSON format');

    const report = {
      date: format(data.date, 'yyyy-MM-dd'),
      topTrends: data.topTrends.slice(0, 10).map((trend) => ({
        keyword: trend.keyword,
        score: trend.score,
        category: trend.category,
        mentionCount: trend.mentionCount,
        source: trend.source,
        hashtags: trend.metadata.hashtags,
      })),
      risingTrends: data.risingTrends.map((trend) => ({
        keyword: trend.keyword,
        score: trend.score,
      })),
      articleProposals: data.articleProposals.map((proposal) => ({
        title: proposal.title,
        angle: proposal.angle,
        targetAudience: proposal.targetAudience,
        recommendedPublishTime: proposal.recommendedPublishTime,
        score: proposal.score,
      })),
      bookPromotions: data.bookPromotions.map((promo) => ({
        bookTitle: promo.book.title,
        recommendationLevel: promo.recommendationLevel,
        reason: promo.reason,
        recommendedPeriod: promo.recommendedPeriod,
      })),
      generatedAt: new Date().toISOString(),
    };

    return JSON.stringify(report, null, 2);
  }

  /**
   * 日次レポートを生成（HTMLダッシュボード形式）
   */
  generateHTML(data: DailyReportData): string {
    logger.info('Generating daily report in HTML dashboard format');

    const dateStr = format(data.date, 'yyyy年MM月dd日');
    const topTrends = data.topTrends.slice(0, 10);

    // カテゴリ別の集計
    const categoryCount = new Map<string, number>();
    topTrends.forEach((trend) => {
      categoryCount.set(trend.category, (categoryCount.get(trend.category) || 0) + 1);
    });

    // Chart.js用のデータ
    const chartLabels = topTrends.map((t) => t.keyword);
    const chartScores = topTrends.map((t) => t.score);

    const categoryLabels = Array.from(categoryCount.keys()).map(
      (cat) => CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS]
    );
    const categoryCounts = Array.from(categoryCount.values());

    return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>トレンドダッシュボード - ${dateStr}</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Hiragino Sans', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    .header {
      background: white;
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 20px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header h1 {
      font-size: 32px;
      color: #333;
      margin-bottom: 10px;
    }
    .header .date {
      color: #666;
      font-size: 18px;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }
    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .stat-card .label {
      color: #666;
      font-size: 14px;
      margin-bottom: 8px;
    }
    .stat-card .value {
      font-size: 36px;
      font-weight: bold;
      color: #667eea;
    }
    .charts {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }
    .chart-card {
      background: white;
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .chart-card h2 {
      font-size: 20px;
      color: #333;
      margin-bottom: 20px;
    }
    .section {
      background: white;
      border-radius: 12px;
      padding: 25px;
      margin-bottom: 20px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .section h2 {
      font-size: 24px;
      color: #333;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #667eea;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th {
      background: #f8f9fa;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #555;
      border-bottom: 2px solid #e0e0e0;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #e0e0e0;
    }
    tr:hover {
      background: #f8f9fa;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    .badge-high {
      background: #fee;
      color: #c33;
    }
    .badge-medium {
      background: #fef7e0;
      color: #d97706;
    }
    .badge-low {
      background: #e0f2fe;
      color: #0369a1;
    }
    .score-bar {
      background: #e0e0e0;
      height: 8px;
      border-radius: 4px;
      overflow: hidden;
    }
    .score-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      transition: width 0.3s;
    }
    .proposal-card {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 15px;
    }
    .proposal-card h3 {
      color: #333;
      font-size: 18px;
      margin-bottom: 10px;
    }
    .proposal-card .meta {
      color: #666;
      font-size: 14px;
      margin-bottom: 5px;
    }
    .footer {
      text-align: center;
      color: white;
      padding: 20px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 トレンドダッシュボード</h1>
      <div class="date">${dateStr}</div>
    </div>

    <div class="stats">
      <div class="stat-card">
        <div class="label">総トレンド数</div>
        <div class="value">${topTrends.length}</div>
      </div>
      <div class="stat-card">
        <div class="label">急上昇ワード</div>
        <div class="value">${data.risingTrends.length}</div>
      </div>
      <div class="stat-card">
        <div class="label">記事提案</div>
        <div class="value">${data.articleProposals.length}</div>
      </div>
      <div class="stat-card">
        <div class="label">書籍プロモ推奨</div>
        <div class="value">${data.bookPromotions.length}</div>
      </div>
    </div>

    <div class="charts">
      <div class="chart-card">
        <h2>📈 トップトレンドスコア</h2>
        <canvas id="scoreChart"></canvas>
      </div>
      <div class="chart-card">
        <h2>📁 カテゴリ別分布</h2>
        <canvas id="categoryChart"></canvas>
      </div>
    </div>

    <div class="section">
      <h2>🔥 トップトレンド</h2>
      <table>
        <thead>
          <tr>
            <th>順位</th>
            <th>キーワード</th>
            <th>スコア</th>
            <th>カテゴリ</th>
            <th>メンション数</th>
            <th>ソース</th>
          </tr>
        </thead>
        <tbody>
${topTrends
  .map(
    (trend, index) => `
          <tr>
            <td><strong>${index + 1}</strong></td>
            <td><strong>${trend.keyword}</strong></td>
            <td>
              <div class="score-bar">
                <div class="score-fill" style="width: ${trend.score}%"></div>
              </div>
              <small>${trend.score}/100</small>
            </td>
            <td>${CATEGORY_LABELS[trend.category]}</td>
            <td>${trend.mentionCount.toLocaleString()}件</td>
            <td>${trend.source}</td>
          </tr>`
  )
  .join('')}
        </tbody>
      </table>
    </div>

${
  data.risingTrends.length > 0
    ? `
    <div class="section">
      <h2>📈 急上昇ワード</h2>
      <table>
        <thead>
          <tr>
            <th>キーワード</th>
            <th>スコア</th>
          </tr>
        </thead>
        <tbody>
${data.risingTrends
  .map(
    (trend) => `
          <tr>
            <td><strong>${trend.keyword}</strong></td>
            <td>${trend.score}/100</td>
          </tr>`
  )
  .join('')}
        </tbody>
      </table>
    </div>`
    : ''
}

${
  data.articleProposals.length > 0
    ? `
    <div class="section">
      <h2>✍️ おすすめ記事テーマ</h2>
${data.articleProposals
  .map(
    (proposal, index) => `
      <div class="proposal-card">
        <h3>${index + 1}. ${proposal.title}</h3>
        <div class="meta"><strong>切り口:</strong> ${proposal.angle}</div>
        <div class="meta"><strong>想定読者:</strong> ${proposal.targetAudience}</div>
        <div class="meta"><strong>推奨公開:</strong> ${format(proposal.recommendedPublishTime, 'MM月dd日 HH:mm')}</div>
        <div class="meta"><strong>理由:</strong> ${proposal.reason}</div>
      </div>`
  )
  .join('')}
    </div>`
    : ''
}

${
  data.bookPromotions.length > 0
    ? `
    <div class="section">
      <h2>📚 書籍プロモーション推奨</h2>
      <table>
        <thead>
          <tr>
            <th>書籍名</th>
            <th>推奨度</th>
            <th>理由</th>
            <th>推奨期間</th>
          </tr>
        </thead>
        <tbody>
${data.bookPromotions
  .map((promo) => {
    const badgeClass =
      promo.recommendationLevel === 'high'
        ? 'badge-high'
        : promo.recommendationLevel === 'medium'
          ? 'badge-medium'
          : 'badge-low';
    const label =
      promo.recommendationLevel === 'high' ? '高' : promo.recommendationLevel === 'medium' ? '中' : '低';
    return `
          <tr>
            <td><strong><a href="${promo.book.amazonUrl}" target="_blank" style="color: #667eea; text-decoration: none;">${promo.book.title}</a></strong></td>
            <td><span class="badge ${badgeClass}">${label}</span></td>
            <td>${promo.reason}</td>
            <td>${format(promo.recommendedPeriod.start, 'MM/dd')} - ${format(promo.recommendedPeriod.end, 'MM/dd')}</td>
          </tr>`;
  })
  .join('')}
        </tbody>
      </table>
    </div>`
    : ''
}

    <div class="footer">
      レポート生成日時: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}
    </div>
  </div>

  <script>
    // スコアチャート
    const scoreCtx = document.getElementById('scoreChart').getContext('2d');
    new Chart(scoreCtx, {
      type: 'bar',
      data: {
        labels: ${JSON.stringify(chartLabels)},
        datasets: [{
          label: 'スコア',
          data: ${JSON.stringify(chartScores)},
          backgroundColor: 'rgba(102, 126, 234, 0.8)',
          borderColor: 'rgba(102, 126, 234, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    });

    // カテゴリチャート
    const categoryCtx = document.getElementById('categoryChart').getContext('2d');
    new Chart(categoryCtx, {
      type: 'doughnut',
      data: {
        labels: ${JSON.stringify(categoryLabels)},
        datasets: [{
          data: ${JSON.stringify(categoryCounts)},
          backgroundColor: [
            'rgba(102, 126, 234, 0.8)',
            'rgba(118, 75, 162, 0.8)',
            'rgba(237, 100, 166, 0.8)',
            'rgba(255, 154, 158, 0.8)',
            'rgba(250, 208, 196, 0.8)',
            'rgba(165, 177, 194, 0.8)'
          ],
          borderWidth: 2,
          borderColor: 'white'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  </script>
</body>
</html>`;
  }
}

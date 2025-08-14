import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, BarChart3, PieChart } from "lucide-react";

interface AnalyticsChartsProps {
  statistics: {
    totalResponses: number;
    averageScore: number;
    completionRate: number;
    chartData: Array<{ date: string; responses: number }>;
    scoreDistribution: Record<string, number>;
  };
}

export function AnalyticsCharts({ statistics }: AnalyticsChartsProps) {
  const { chartData, scoreDistribution } = statistics;

  // Simple bar chart for responses over time
  const maxResponses = Math.max(...chartData.map(d => d.responses), 1);
  
  // Score distribution chart
  const scoreEntries = Object.entries(scoreDistribution);
  const maxScore = Math.max(...scoreEntries.map(([, count]) => count), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Responses Over Time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Responses Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No response data available
            </div>
          ) : (
            <div className="space-y-3">
              {chartData.slice(-7).map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-20 text-xs text-slate-600 truncate">
                    {new Date(item.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="flex-1 bg-slate-200 rounded-full h-4 relative">
                    <div 
                      className="bg-primary h-4 rounded-full transition-all duration-300"
                      style={{ width: `${(item.responses / maxResponses) * 100}%` }}
                    ></div>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-slate-700">
                      {item.responses}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Score Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Score Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          {scoreEntries.every(([, count]) => count === 0) ? (
            <div className="text-center py-8 text-slate-500">
              No score data available
            </div>
          ) : (
            <div className="space-y-3">
              {scoreEntries.map(([range, count]) => (
                <div key={range} className="flex items-center space-x-3">
                  <div className="w-16 text-xs text-slate-600">
                    {range}%
                  </div>
                  <div className="flex-1 bg-slate-200 rounded-full h-4 relative">
                    <div 
                      className={`h-4 rounded-full transition-all duration-300 ${
                        range === '81-100' ? 'bg-green-500' :
                        range === '61-80' ? 'bg-blue-500' :
                        range === '41-60' ? 'bg-yellow-500' :
                        range === '21-40' ? 'bg-orange-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${(count / maxScore) * 100}%` }}
                    ></div>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-slate-700">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Response Quality Insights */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center">
            <PieChart className="w-5 h-5 mr-2" />
            Response Quality Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700 mb-1">
                {scoreDistribution['81-100'] || 0}
              </div>
              <div className="text-sm text-green-600 mb-2">Excellent (81-100%)</div>
              <Badge variant="outline" className="text-green-700 border-green-300">
                High Performers
              </Badge>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700 mb-1">
                {(scoreDistribution['61-80'] || 0) + (scoreDistribution['41-60'] || 0)}
              </div>
              <div className="text-sm text-blue-600 mb-2">Good (41-80%)</div>
              <Badge variant="outline" className="text-blue-700 border-blue-300">
                Average Performers
              </Badge>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-700 mb-1">
                {(scoreDistribution['0-20'] || 0) + (scoreDistribution['21-40'] || 0)}
              </div>
              <div className="text-sm text-red-600 mb-2">Needs Improvement (0-40%)</div>
              <Badge variant="outline" className="text-red-700 border-red-300">
                Low Performers
              </Badge>
            </div>
          </div>
          
          {statistics.totalResponses > 0 && (
            <div className="mt-6 p-4 bg-slate-50 rounded-lg">
              <h4 className="font-medium text-slate-800 mb-2">Key Insights:</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>
                  • {statistics.completionRate.toFixed(1)}% of respondents completed all questions
                </li>
                <li>
                  • Average score is {statistics.averageScore}% 
                  {statistics.averageScore >= 70 ? ' (Good performance)' : 
                   statistics.averageScore >= 50 ? ' (Average performance)' : 
                   ' (Consider reviewing question difficulty)'}
                </li>
                <li>
                  • Most recent activity: {chartData.length > 0 ? 
                    new Date(chartData[chartData.length - 1].date).toLocaleDateString() : 
                    'No recent activity'}
                </li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

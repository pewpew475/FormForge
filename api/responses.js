// Responses API endpoint for Vercel
import { getSupabase } from '../dist/supabase.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const supabase = getSupabase();
    const { formId } = req.query;

    if (req.method === 'GET') {
      if (!formId) {
        return res.status(400).json({ error: 'Form ID is required' });
      }

      // Get all responses for the form
      const { data: responses, error: responsesError } = await supabase
        .from('responses')
        .select('*')
        .eq('form_id', formId)
        .order('submitted_at', { ascending: false });

      if (responsesError) throw responsesError;

      // Get form details
      const { data: form, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('id', formId)
        .single();

      if (formError) throw formError;

      // Calculate statistics
      const totalResponses = responses.length;
      const averageScore = responses.length > 0 
        ? responses.reduce((sum, r) => sum + (r.score || 0), 0) / responses.length 
        : 0;

      // Calculate completion rate (responses with all questions answered)
      const completedResponses = responses.filter(response => {
        const answers = response.answers || {};
        const totalQuestions = form.questions?.length || 0;
        const answeredQuestions = Object.keys(answers).length;
        return answeredQuestions === totalQuestions;
      });

      const completionRate = totalResponses > 0 
        ? (completedResponses.length / totalResponses) * 100 
        : 0;

      // Group responses by date for chart data
      const responsesByDate = responses.reduce((acc, response) => {
        const date = new Date(response.submitted_at).toDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      const chartData = Object.entries(responsesByDate).map(([date, count]) => ({
        date,
        responses: count
      }));

      // Calculate score distribution
      const scoreRanges = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 };
      responses.forEach(response => {
        const score = response.score || 0;
        if (score <= 20) scoreRanges['0-20']++;
        else if (score <= 40) scoreRanges['21-40']++;
        else if (score <= 60) scoreRanges['41-60']++;
        else if (score <= 80) scoreRanges['61-80']++;
        else scoreRanges['81-100']++;
      });

      res.status(200).json({
        responses,
        statistics: {
          totalResponses,
          averageScore: Math.round(averageScore * 100) / 100,
          completionRate: Math.round(completionRate * 100) / 100,
          chartData,
          scoreDistribution: scoreRanges
        }
      });

    } else if (req.method === 'POST') {
      // Create new response
      const { answers, score } = req.body;
      
      if (!formId || !answers) {
        return res.status(400).json({ error: 'Form ID and answers are required' });
      }

      const { data: response, error } = await supabase
        .from('responses')
        .insert([{
          form_id: formId,
          answers,
          score: score || 0
        }])
        .select()
        .single();

      if (error) throw error;
      
      res.status(201).json(response);

    } else if (req.method === 'DELETE') {
      // Delete response
      const { responseId } = req.query;
      
      if (!responseId) {
        return res.status(400).json({ error: 'Response ID is required' });
      }

      const { error } = await supabase
        .from('responses')
        .delete()
        .eq('id', responseId);

      if (error) throw error;
      
      res.status(200).json({ message: 'Response deleted successfully' });

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Responses API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

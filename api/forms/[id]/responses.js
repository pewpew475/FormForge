// Form responses API endpoint for Vercel
import { getSupabase } from '../../../dist/supabase.js';

// Authentication helper for Vercel API routes
async function authenticateUser(req) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  const supabase = getSupabase();

  try {
    // Verify the JWT token
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      ...user.user_metadata,
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

// Simple scoring function
function calculateScore(questions, answers) {
  if (!questions || !answers) return 0;
  
  let totalQuestions = 0;
  let correctAnswers = 0;

  questions.forEach(question => {
    const userAnswer = answers[question.id];
    if (!userAnswer) return;

    totalQuestions++;

    switch (question.type) {
      case 'categorize':
        if (question.correctAnswer && userAnswer) {
          const correct = question.correctAnswer;
          const user = userAnswer;
          let categoryScore = 0;
          let totalCategories = 0;

          Object.keys(correct).forEach(category => {
            totalCategories++;
            const correctItems = correct[category] || [];
            const userItems = user[category] || [];
            
            if (correctItems.length === userItems.length &&
                correctItems.every(item => userItems.includes(item))) {
              categoryScore++;
            }
          });

          if (categoryScore === totalCategories) {
            correctAnswers++;
          }
        }
        break;

      case 'cloze':
        if (question.correctAnswer && userAnswer) {
          const correctBlanks = question.correctAnswer;
          const userBlanks = userAnswer;
          let correctBlankCount = 0;

          Object.keys(correctBlanks).forEach(blankId => {
            if (userBlanks[blankId] && 
                userBlanks[blankId].toLowerCase().trim() === 
                correctBlanks[blankId].toLowerCase().trim()) {
              correctBlankCount++;
            }
          });

          if (correctBlankCount === Object.keys(correctBlanks).length) {
            correctAnswers++;
          }
        }
        break;

      case 'comprehension':
        if (question.subQuestions && userAnswer) {
          let correctSubAnswers = 0;
          question.subQuestions.forEach(subQ => {
            const userSubAnswer = userAnswer[subQ.id];
            if (userSubAnswer === subQ.correctAnswer) {
              correctSubAnswers++;
            }
          });

          if (correctSubAnswers === question.subQuestions.length) {
            correctAnswers++;
          }
        }
        break;
    }
  });

  return totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const supabase = getSupabase();
    const { id: formId } = req.query;

    // Authenticate user for all operations
    const user = await authenticateUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.method === 'GET') {
      // Get all responses for the form with statistics
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

      if (formError) {
        if (formError.code === 'PGRST116') {
          return res.status(404).json({ error: 'Form not found' });
        }
        throw formError;
      }

      // Calculate statistics
      const totalResponses = responses.length;
      const averageScore = responses.length > 0 
        ? responses.reduce((sum, r) => sum + (r.score || 0), 0) / responses.length 
        : 0;

      // Calculate completion rate
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

      const chartData = Object.entries(responsesByDate)
        .map(([date, count]) => ({
          date,
          responses: count
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

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
        form,
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
      const { answers } = req.body;

      if (!answers) {
        return res.status(400).json({ error: 'Answers are required' });
      }

      // Check if user already submitted this form
      const { data: existingResponse, error: existingError } = await supabase
        .from('responses')
        .select('*')
        .eq('form_id', formId)
        .eq('user_id', user.id)
        .single();

      if (existingResponse) {
        return res.status(409).json({
          error: 'You have already submitted a response to this form',
          existingResponse: { ...existingResponse, score: existingResponse.score }
        });
      }

      // Get form to calculate score
      const { data: form, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('id', formId)
        .single();

      if (formError) {
        if (formError.code === 'PGRST116') {
          return res.status(404).json({ error: 'Form not found' });
        }
        throw formError;
      }

      // Calculate score
      const score = calculateScore(form.questions, answers);

      const { data: response, error } = await supabase
        .from('responses')
        .insert([{
          form_id: formId,
          answers,
          score,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({ ...response, score });

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Form responses API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

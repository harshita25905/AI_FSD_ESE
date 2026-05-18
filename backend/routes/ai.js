const express = require('express');
const router = express.Router();
const axios = require('axios');
const Employee = require('../models/Employee');
const { protect } = require('../middleware/authMiddleware');

// Helper to interact with OpenRouter
const getAIRecommendation = async (prompt) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const modelsToTry = [
        'google/gemini-2.5-flash:free',
        'meta-llama/llama-3-8b-instruct:free',
        'qwen/qwen-2.5-72b-instruct:free',
        'meta-llama/llama-3.3-70b-instruct:free',
        'deepseek/deepseek-r1:free'
    ];

    let lastError = null;

    for (const model of modelsToTry) {
        try {
            console.log(`Sending request to OpenRouter using model: ${model}`);
            const response = await axios.post(
                'https://openrouter.ai/api/v1/chat/completions',
                {
                    model: model,
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an expert HR Performance Analyst AI. You must provide all recommendations and rankings in valid, strictly parseable JSON format. Do not write any conversational text or explanation outside the JSON. Do not include markdown code fences (like ```json) in your final output; return only the raw JSON string.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    response_format: { type: "json_object" }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': 'https://github.com/antigravity/employee-perf-analytics',
                        'X-Title': 'AI Employee Performance Analytics'
                    },
                    timeout: 20000 // 20s timeout per model
                }
            );

            if (response.data?.choices?.[0]?.message?.content) {
                console.log(`Successfully received response from OpenRouter using model: ${model}`);
                return response.data.choices[0].message.content;
            }
        } catch (error) {
            console.warn(`Model ${model} failed. Error:`, error.response?.data || error.message);
            lastError = error;
            // Proceed to the next candidate model
        }
    }

    const errorMsg = lastError?.response?.data 
        ? (typeof lastError.response.data === 'object' ? JSON.stringify(lastError.response.data) : lastError.response.data)
        : lastError?.message;
    console.error('All AI models failed:', errorMsg);
    throw new Error('AI Service is temporarily unavailable. Details: ' + errorMsg);
};

// High-quality local algorithmic recommendation generator (resilient fallback)
const generateLocalRecommendation = (employee) => {
    const { name, department, skills, performanceScore, experience } = employee;
    
    let promotionRecommendation = '';
    let suitabilityScore = 0;
    
    if (performanceScore >= 85 && experience >= 3) {
        promotionRecommendation = `Highly Recommended for Promotion. ${name} has demonstrated outstanding technical leadership in the ${department} department, maintaining an excellent performance benchmark of ${performanceScore}%. With ${experience} years of experience and deep expertise in ${skills.slice(0, 3).join(', ')}, they are ready to step into senior responsibilities.`;
        suitabilityScore = Math.min(100, Math.round(performanceScore * 1.05));
    } else if (performanceScore >= 75) {
        promotionRecommendation = `Strong Candidate / Keep Under Observation. ${name} shows solid competency and contributes heavily to the ${department} domain. Their score of ${performanceScore}% indicates good readiness, but a few more months of leadership exposure or acquiring skills in modern paradigms is advised before final promotion.`;
        suitabilityScore = Math.round(performanceScore);
    } else {
        promotionRecommendation = `Retain in Current Role for Development. ${name} needs to focus on core performance metrics (current score: ${performanceScore}%) and gain deeper experience. We recommend providing them with targeted technical mentorship and reassessing in 6 months.`;
        suitabilityScore = Math.round(performanceScore * 0.9);
    }

    const coreSkills = skills.map(s => s.toLowerCase());
    const trainingSuggestions = [];
    
    if (!coreSkills.includes('react') && !coreSkills.includes('angular') && !coreSkills.includes('frontend')) {
        trainingSuggestions.push('Advanced Frontend Architectures (React/TypeScript)');
    }
    if (!coreSkills.includes('node') && !coreSkills.includes('express') && !coreSkills.includes('backend')) {
        trainingSuggestions.push('Scalable Backend Architectures & Node.js performance tuning');
    }
    if (!coreSkills.includes('mongodb') && !coreSkills.includes('sql') && !coreSkills.includes('database')) {
        trainingSuggestions.push('Modern Database Modeling & Distributed Systems (NoSQL/MongoDB)');
    }
    if (trainingSuggestions.length < 3) {
        trainingSuggestions.push('System Design & High-Level Architecture Benchmarking');
        trainingSuggestions.push('Agile Team Leadership & Technical Product Management');
    }

    let feedback = '';
    if (performanceScore >= 80) {
        feedback = `${name} has shown exceptional initiative and consistent performance. Strengths: Deep technical expertise in ${skills.join(', ')}, fast execution, and a high-quality delivery rate. Development Area: Focus on mentoring junior colleagues and taking charge of system-wide architectural decisions.`;
    } else if (performanceScore >= 60) {
        feedback = `${name} is a reliable team member who meets core deliverables. Strengths: Competent execution of tasks, strong understanding of the ${department} workflow, and good collaboration skills. Development Area: Enhancing ownership of complex features and upgrading skills in modern frameworks.`;
    } else {
        feedback = `${name}'s current performance benchmark is below expectation. Strengths: Basic understanding of ${skills.join(', ')}. Development Area: Active mentorship is required. Must improve focus on code quality, deadlines, and technical documentation.`;
    }

    return {
        promotionRecommendation,
        trainingSuggestions: trainingSuggestions.slice(0, 3),
        feedback,
        suitabilityScore
    };
};

// High-quality local rankings generator (resilient fallback)
const generateLocalRankings = (employees) => {
    const sorted = [...employees].sort((a, b) => {
        if (b.performanceScore !== a.performanceScore) {
            return b.performanceScore - a.performanceScore;
        }
        return b.experience - a.experience;
    });

    const rankings = sorted.map((emp, index) => {
        const localRec = generateLocalRecommendation(emp);
        return {
            employeeId: emp._id.toString(),
            name: emp.name,
            rank: index + 1,
            reasoning: `${emp.name} is placed at Rank #${index + 1} with an outstanding performance index of ${emp.performanceScore}% and ${emp.experience} years of professional tenure. They show a clear edge in ${emp.skills.slice(0, 2).join(' and ')} competence.`,
            promotionRecommendation: localRec.promotionRecommendation,
            trainingSuggestions: localRec.trainingSuggestions,
            feedback: localRec.feedback.split('Development Area:')[0].trim()
        };
    });

    return { rankings };
};

// Clean raw JSON response from AI
const parseJSONResponse = (rawText) => {
    let cleanText = rawText.trim();
    if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    }
    return JSON.parse(cleanText);
};

// @desc    Generate AI recommendations for single or multiple employees
// @route   POST /api/ai/recommend
// @access  Private
router.post('/recommend', protect, async (req, res, next) => {
    try {
        const { employeeId, employeeIds } = req.body;

        if (!employeeId && (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0)) {
            return res.status(400).json({ message: 'Please provide either employeeId (for single employee analysis) or an array of employeeIds (for ranking analysis).' });
        }

        if (employeeId) {
            const employee = await Employee.findById(employeeId);
            if (!employee) {
                return res.status(404).json({ message: 'Employee not found' });
            }

            const prompt = `Analyze this employee's performance metrics, experience, and skills, and provide:
1. Promotion Recommendation: A clear recommendation (e.g. Recommend for Promotion, Under Observation, Keep in Current Role) with professional justification.
2. Training Suggestions: Specific skill enhancement/development topics custom tailored based on their current skills, department, and score.
3. AI Feedback Generation: Constructive development feedback outlining both key strengths and areas needing improvement.
4. Suitability Score: A numeric score from 0-100 indicating their overall readiness for higher responsibilities.

Employee Details:
- Name: ${employee.name}
- Department: ${employee.department}
- Skills: ${employee.skills.join(', ')}
- Performance Score: ${employee.performanceScore}/100
- Years of Experience: ${employee.experience} years

Your response MUST be a single, valid JSON object matching this structure EXACTLY:
{
  "promotionRecommendation": "string explaining promotion suggestion and rationale",
  "trainingSuggestions": ["string suggestion 1", "string suggestion 2", "string suggestion 3"],
  "feedback": "detailed constructive feedback text",
  "suitabilityScore": number
}`;

            const aiResponseRaw = await getAIRecommendation(prompt);
            const aiData = parseJSONResponse(aiResponseRaw);
            return res.json({ employee, analysis: aiData });

        } else {
            const employees = await Employee.find({ _id: { $in: employeeIds } });
            if (employees.length === 0) {
                return res.status(404).json({ message: 'No employees found matching the provided IDs' });
            }

            const employeesListStr = employees.map((emp, index) => `${index + 1}. ID: ${emp._id}, Name: ${emp.name}, Department: ${emp.department}, Skills: [${emp.skills.join(', ')}], Performance Score: ${emp.performanceScore}, Years of Experience: ${emp.experience}`).join('\n');

            const prompt = `Compare and rank the following employees based on their performance scores, years of experience, and skills. Provide a clear ranking list where 1 is the top performer.
For each employee, provide:
1. Rank (number starting from 1)
2. Reasoning for the rank (incorporating performance score and experience)
3. Promotion Recommendation (e.g., Immediate Promotion, High Potential, Keep in Current Role)
4. Training Suggestions (specific courses or skills to acquire)
5. AI Feedback (brief strengths/weaknesses)

Employees to analyze and rank:
${employeesListStr}

Your response MUST be a single, valid JSON object matching this structure EXACTLY:
{
  "rankings": [
    {
      "employeeId": "string (matching their database ID)",
      "name": "string (matching their name)",
      "rank": number,
      "reasoning": "string explanation",
      "promotionRecommendation": "string suggestion",
      "trainingSuggestions": ["string course 1", "string course 2"],
      "feedback": "string brief feedback"
    }
  ]
}`;

            const aiResponseRaw = await getAIRecommendation(prompt);
            const aiData = parseJSONResponse(aiResponseRaw);
            return res.json(aiData);
        }

    } catch (error) {
        console.warn('OpenRouter API call failed. Activating secure local fallback analytics engine. Error:', error.message);
        
        try {
            const { employeeId, employeeIds } = req.body;
            if (employeeId) {
                const employee = await Employee.findById(employeeId);
                if (!employee) {
                    return res.status(404).json({ message: 'Employee not found' });
                }
                const analysis = generateLocalRecommendation(employee);
                return res.json({ employee, analysis });
            } else {
                const employees = await Employee.find({ _id: { $in: employeeIds } });
                if (employees.length === 0) {
                    return res.status(404).json({ message: 'No employees found matching the provided IDs' });
                }
                const rankingsData = generateLocalRankings(employees);
                return res.json(rankingsData);
            }
        } catch (fallbackError) {
            console.error('AI Fallback engine also failed:', fallbackError);
            res.status(500).json({ 
                message: 'Failed to generate AI recommendations', 
                error: error.message 
            });
        }
    }
});

module.exports = router;

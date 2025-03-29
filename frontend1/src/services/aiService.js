import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Updated context to be more focused on emergency responses
const emergencyContext = `You are an emergency assistance AI expert. Focus on:
- Providing immediate, actionable emergency guidance
- Giving clear safety instructions
- Sharing relevant emergency contact numbers
- Offering first aid advice when needed
- Helping with disaster preparedness
- Maintaining calm, clear communication

Current supported emergencies: floods, earthquakes, fires, medical emergencies, and natural disasters.`;

export const getAIResponse = async (userInput, conversationHistory) => {
  try {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      console.error('Gemini API key is not configured');
      return getFallbackResponse(userInput);
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });
    
    // Updated prompt structure for the latest API version
    const prompt = `${emergencyContext}\n\nConversation History:\n${conversationHistory}\n\nUser Message: ${userInput}\n\nProvide a clear, helpful response focusing on emergency guidance if needed. Be direct and practical.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    if (!response || !response.text) {
      console.error('Empty response from Gemini API');
      return getFallbackResponse(userInput);
    }

    const text = response.text();
    
    // Enhanced response cleaning
    const cleanedResponse = text
      .replace(/AI:|Assistant:|Emergency AI:/gi, '')
      .replace(/^\s+|\s+$/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\*\*/g, '') // Remove asterisks while keeping the text bold
      .replace(/\*([^*]+)\*/g, '$1') // Remove single asterisks
      .trim();

    return cleanedResponse || getFallbackResponse(userInput);
  } catch (error) {
    console.error('Error getting AI response:', error);
    return getFallbackResponse(userInput);
  }
};

// Fallback responses for different types of queries
const getFallbackResponse = (userInput) => {
  const input = userInput.toLowerCase();
  const location = detectLocation(input);
  
  // Natural Disasters
  if (input.includes('flood')) {
    return `I understand you're dealing with a flood situation. Let me help you stay safe. First, please call emergency services at ${getEmergencyNumber(location, 'general')} if you haven't already. Are you currently in a safe location? If not, please move to higher ground immediately. I can guide you through the next steps - would you like me to explain what to do next?`;
  }

  if (input.includes('earthquake')) {
    return `I hear you're experiencing an earthquake. Are you indoors or outdoors? If you're indoors, please drop to the ground, take cover under a sturdy piece of furniture, and hold on. If you're outdoors, move away from buildings and power lines. Let me know your situation, and I'll guide you through the next steps.`;
  }

  if (input.includes('tsunami')) {
    return `I understand you're concerned about a tsunami. Are you currently near the coast? If so, please move to higher ground immediately - at least 100 feet above sea level or 2 miles inland. Don't wait for official warnings if you feel strong ground shaking or see the ocean receding. Call ${getEmergencyNumber(location, 'general')} to alert authorities. Would you like me to guide you through evacuation procedures?`;
  }

  if (input.includes('landslide')) {
    return `I hear you're dealing with a landslide situation. Are you currently in an affected area? If so, please move away from steep slopes, river valleys, and areas with loose soil immediately. Call ${getEmergencyNumber(location, 'general')} to report the landslide. Are you able to evacuate safely? Let me know your situation, and I'll help guide you through the next steps.`;
  }

  if (input.includes('cyclone') || input.includes('hurricane') || input.includes('storm')) {
    return `I understand you're experiencing a storm situation. Are you currently indoors? If not, please seek shelter immediately. Stay away from windows and doors. Have you secured your emergency supplies? I can help you prepare if needed. In the meantime, please call ${getEmergencyNumber(location, 'general')} if you need immediate assistance.`;
  }

  if (input.includes('volcano')) {
    return `I hear you're dealing with a volcanic situation. Are you in the immediate vicinity of the volcano? If so, please evacuate immediately and move upwind of the volcano. Avoid river valleys and low-lying areas. Call ${getEmergencyNumber(location, 'general')} to report your location. Would you like guidance on evacuation routes or safety measures?`;
  }

  if (input.includes('drought')) {
    return `I understand you're experiencing drought conditions. Are you currently facing water shortages? I can help you with water conservation tips and finding alternative water sources. Have you contacted local authorities about water restrictions? Let me know your specific concerns, and I'll provide relevant guidance.`;
  }

  if (input.includes('wildfire') || input.includes('forest fire')) {
    return `I hear you're dealing with a wildfire situation. Are you currently in the affected area? If so, please evacuate immediately if ordered. If you're not in immediate danger, have you prepared your home for wildfire protection? Call ${getEmergencyNumber(location, 'fire')} to report any fires. Would you like guidance on evacuation procedures or fire safety measures?`;
  }

  if (input.includes('avalanche')) {
    return `I understand you're concerned about an avalanche. Are you currently in a mountainous area? If so, please move to higher ground immediately and avoid steep slopes. Call ${getEmergencyNumber(location, 'general')} to alert rescue services. Do you have avalanche safety equipment with you? Let me know your situation, and I'll provide specific guidance.`;
  }

  // Medical Emergencies
  if (input.includes('first aid')) {
    return `I can help you with first aid information. What specific situation are you dealing with? Is it bleeding, burns, or something else? This will help me give you the most relevant guidance. In the meantime, please call ${getEmergencyNumber(location, 'medical')} if you haven't already.`;
  }

  // General Emergency
  if (input.includes('emergency') || input.includes('help')) {
    return `I'm here to help. Could you tell me more about what's happening? This will help me provide the most relevant assistance. In the meantime, please call ${getEmergencyNumber(location, 'general')} if you haven't already.`;
  }

  // Greetings
  if (input.includes('hello') || input.includes('hi')) {
    return `Hi there! I'm here to help you with any emergency or safety concerns you might have. What can I assist you with today?`;
  }
  
  return `I want to make sure I understand your situation correctly. Could you tell me more about what you're experiencing? This will help me provide the most helpful response.`;
};

// Helper functions for international support
const detectLocation = (input) => {
  const locations = {
    'india': 'India',
    'usa': 'United States',
    'uk': 'United Kingdom',
    'australia': 'Australia',
    'canada': 'Canada',
    'japan': 'Japan',
    'eu': 'European Union'
  };
  
  for (const [key, value] of Object.entries(locations)) {
    if (input.includes(key)) {
      return value;
    }
  }
  return null;
};

const getEmergencyNumber = (location, type) => {
  const numbers = {
    'India': {
      general: '100',
      medical: '108',
      fire: '101'
    },
    'United States': {
      general: '911',
      medical: '911',
      fire: '911'
    },
    'United Kingdom': {
      general: '999',
      medical: '999',
      fire: '999'
    },
    'Australia': {
      general: '000',
      medical: '000',
      fire: '000'
    },
    'Canada': {
      general: '911',
      medical: '911',
      fire: '911'
    },
    'Japan': {
      general: '110',
      medical: '119',
      fire: '119'
    },
    'European Union': {
      general: '112',
      medical: '112',
      fire: '112'
    }
  };

  if (location && numbers[location]) {
    return numbers[location][type] || numbers[location].general;
  }
  return '112'; // Universal emergency number
};

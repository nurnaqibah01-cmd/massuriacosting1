import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ChefHat, Send, Sparkles, AlertCircle } from 'lucide-react';
import Markdown from 'react-markdown';

// Initialize the Gemini client using the injected API key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function AIAdvisor() {
  const [ingredients, setIngredients] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [error, setError] = useState('');

  const generateSuggestions = async () => {
    if (!ingredients.trim()) return;
    
    setIsLoading(true);
    setError('');
    setSuggestion('');
    
    try {
      const prompt = `I am a catering business owner (Mas Suria Catering). 
I have accidentally bought or have leftover of the following ingredients: ${ingredients}.

Please act as a culinary consultant. Suggest 3 profitable catering menus, dishes, or value-add side dishes I can make to utilize these specific extra ingredients and avoid waste. 
Provide brief ideas and why it's a good inclusion for a catering package. Use clear Markdown format with bullet points and bold text.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      setSuggestion(response.text || 'No response generated.');
    } catch (err: any) {
      console.error('Error generating suggestions:', err);
      setError(err.message || 'Failed to generate suggestions. Please check your API key configuration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center">
        <Sparkles className="w-8 h-8 text-indigo-500 mr-3 print:hidden" />
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Surplus Ingredients Advisor</h1>
          <p className="text-sm text-slate-500 mt-1 print:hidden">Powered by Google Gemini AI</p>
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
        <p className="text-slate-600 mb-6 font-medium">
          Did you buy more ingredients than usual? Don't let them go to waste. Tell us what you have extra of, and we'll suggest new menu items or dishes you can add to your catering packages to maximize profit.
        </p>
        
        <div className="space-y-4">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Extra Ingredients</label>
          <div className="relative">
            <textarea 
              rows={4}
              placeholder="e.g. 10kg of chicken breast, 5 crates of eggs, a lot of extra carrots and coconut milk..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 placeholder-slate-400 font-medium"
              value={ingredients}
              onChange={e => setIngredients(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div className="flex justify-end">
            <button 
              onClick={generateSuggestions}
              disabled={isLoading || !ingredients.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-bold transition-colors flex items-center shadow-md shadow-indigo-200"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing Ingredients...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Get Suggestions
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-start border border-red-200">
          <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {suggestion && (
        <div className="bg-indigo-600 rounded-2xl shadow-lg border border-indigo-500 p-6 md:p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center mb-6 pb-4 border-b border-indigo-400/50">
              <div className="bg-white/20 p-2 rounded-xl border border-white/20 mr-3 text-indigo-100 backdrop-blur-md">
                <ChefHat className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white m-0">Chef's Recommendations</h2>
            </div>
            <div className="prose prose-invert prose-indigo max-w-none text-indigo-50 leading-relaxed font-medium">
              <Markdown>{suggestion}</Markdown>
            </div>
          </div>
          
          <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/5 rounded-full pointer-events-none"></div>
          <div className="absolute right-12 top-4 w-12 h-12 bg-white/5 rounded-full pointer-events-none"></div>
        </div>
      )}
    </div>
  );
}

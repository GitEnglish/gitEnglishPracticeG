// Stub for deepseekService to make exports valid.
// The actual implementation is being worked on in another branch or step.
export const generateExercise = async () => {};

let localApiKey = '';

export const setApiKey = (key: string) => {
    localApiKey = key;
};

export const getApiKey = () => {
    return localApiKey || (typeof localStorage !== 'undefined' ? localStorage.getItem('deepseek_api_key') : '') || import.meta.env.VITE_DEEPSEEK_API_KEY || '';
};

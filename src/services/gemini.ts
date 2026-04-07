export async function generateMemeImage(prompt: string): Promise<string> {
  try {
    const response = await fetch('https://api.imgflip.com/get_memes');
    const json = await response.json();
    
    if (json.success) {
      const memes = json.data.memes;
      // Essayons de trouver un mème qui correspond au prompt, sinon on en prend un au hasard
      const matchedMeme = memes.find((m: any) => 
        m.name.toLowerCase().includes(prompt.toLowerCase())
      );
      
      const selectedMeme = matchedMeme || memes[Math.floor(Math.random() * memes.length)];
      return selectedMeme.url;
    }
    
    throw new Error("Aucune image récupérée depuis Imgflip");
  } catch (error) {
    console.error("Error fetching image from Imgflip:", error);
    throw error;
  }
}

export async function suggestMemePrompt(): Promise<string> {
  try {
    const response = await fetch('https://api.imgflip.com/get_memes');
    const json = await response.json();
    if (json.success) {
      const memes = json.data.memes;
      const randomMeme = memes[Math.floor(Math.random() * memes.length)];
      return randomMeme.name;
    }
    return "Distracted Boyfriend";
  } catch (error) {
    return "Distracted Boyfriend";
  }
}

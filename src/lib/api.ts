// API base URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function uploadVoice(audioBlob: Blob, fileName: string = "user_voice.webm"): Promise<string> {
    const formData = new FormData();
    formData.append('audio_file', audioBlob, fileName);
    
    const response = await fetch(`${API_BASE_URL}/api/clone-voice`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        console.error("Upload voice error:", errorData);
        throw new Error(errorData.detail || 'Failed to clone voice');
    }
    
    const data = await response.json();
    if (!data.voice_id) {
        console.error("Voice ID missing in response:", data);
        throw new Error('Voice ID not found in clone response');
    }
    return data.voice_id;
}

export interface InitiateFaceswapResponse {
  akool_task_id: string | null;
  akool_job_id: string | null;
  message: string;
  details: string | null;
  direct_url?: string;
}

export async function initiateFaceswapVideo(photoFile: File): Promise<InitiateFaceswapResponse> {
    const formData = new FormData();
    formData.append('user_image', photoFile, photoFile.name);

    const response = await fetch(`${API_BASE_URL}/api/initiate-faceswap`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to parse error from faceswap initiation' }));
        console.error("Initiate faceswap video error:", errorData);
        throw new Error(errorData.detail || 'Failed to initiate faceswap video');
    }

    const responseData = await response.json();
    return {
      akool_task_id: responseData.akool_task_id,
      akool_job_id: responseData.akool_job_id,
      message: responseData.message,
      details: responseData.details,
      direct_url: responseData.direct_url
    };
}

export interface FaceswapStatus {
    task_id: string;
    status_details: {
        faceswap_status?: number;
        url?: string;
        msg?: string;
        _id?: string;
    };
}

export async function getFaceswapVideoStatus(taskId: string): Promise<FaceswapStatus> {
    const response = await fetch(`${API_BASE_URL}/api/faceswap-status/${taskId}`, {
        method: 'GET',
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to parse error from faceswap status check' }));
        console.error("Get faceswap video status error:", errorData);
        throw new Error(errorData.detail || 'Failed to get faceswap video status');
    }
    return response.json();
}

export async function getElevenLabsIntroAudio(text: string, voiceId: string): Promise<{ audioUrl: string }> {
    const response = await fetch(`${API_BASE_URL}/api/generate-narrator-speech`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text, voice_id: voiceId }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to parse error from narrator speech generation' }));
        console.error("Generate narrator speech error:", errorData);
        throw new Error(errorData.detail || 'Failed to generate narrator speech');
    }

    // Instead of expecting JSON, get the audio data as a blob
    const audioBlob = await response.blob();
    if (audioBlob.size === 0) {
        console.error("Narrator speech response is an empty blob.");
        throw new Error('Received empty audio response from server');
    }
    const audioUrl = URL.createObjectURL(audioBlob);
    return { audioUrl }; 
}
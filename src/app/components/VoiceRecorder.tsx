'use client'
import { useState, useRef } from 'react'
import { uploadVoice } from '@/lib/api'

interface VoiceRecorderProps {
  onVoiceCloned: (voiceId: string) => void
}

export default function VoiceRecorder({ onVoiceCloned }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      chunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' })
        setAudioBlob(audioBlob)
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    }
  }

  const handleUpload = async () => {
    if (!audioBlob) return

    setIsProcessing(true)
    try {
      const voiceId = await uploadVoice(audioBlob)
      onVoiceCloned(voiceId)
    } catch (error) {
      console.error('Error uploading voice:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Record Your Voice</h2>
      <p className="mb-4 text-gray-600">
        To demonstrate how voice cloning works, we'll need a sample of your voice.
        Please read the following text aloud:
      </p>
      <div className="bg-gray-100 p-4 rounded mb-4">
        "Hello, this is a test recording to understand how voice cloning technology works."
      </div>
      
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`px-6 py-3 rounded-full text-white font-medium
            ${isRecording 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-blue-500 hover:bg-blue-600'
            }`}
          disabled={isProcessing}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>

        {audioBlob && (
          <div className="w-full max-w-md">
            <audio src={URL.createObjectURL(audioBlob)} controls className="w-full mb-4" />
            <button
              onClick={handleUpload}
              disabled={isProcessing}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
            >
              {isProcessing ? 'Processing...' : 'Continue'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
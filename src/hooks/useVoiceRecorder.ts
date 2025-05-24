import { useState, useRef } from 'react'

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        mediaRecorderRef.current = new MediaRecorder(stream)
        audioChunksRef.current = []

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data)
          }
        }

        mediaRecorderRef.current.onstop = () => {
          const blobMimeType = mediaRecorderRef.current?.mimeType || 'audio/webm'
          const completeBlob = new Blob(audioChunksRef.current, { type: blobMimeType })
          setAudioBlob(completeBlob)
          
          const newAudioUrl = URL.createObjectURL(completeBlob)
          setAudioUrl(newAudioUrl)
          
          stream.getTracks().forEach(track => track.stop())
        }

        mediaRecorderRef.current.start(1000)
        setIsRecording(true)
      } catch (err) {
        console.error("Error starting recording:", err)
        setIsRecording(false)
      }
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  return {
    isRecording,
    startRecording,
    stopRecording,
    audioBlob,
    audioUrl,
    setAudioUrl,
    setAudioBlob
  }
} 
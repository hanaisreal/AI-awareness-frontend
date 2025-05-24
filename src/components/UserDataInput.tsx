'use client'
import { useState, useRef } from 'react'
import { useVoiceRecorder } from '../hooks/useVoiceRecorder'

interface UserDataInputProps {
  onImageUpload?: (imageFile: File) => void
  onVoiceRecording?: (audioBlob: Blob) => void
  isProcessing: boolean
  processingMessage: string | null
  inputMode: 'image' | 'voice'
  scriptToRead?: string;
}

export default function UserDataInput({ 
  onImageUpload, 
  onVoiceRecording,
  isProcessing, 
  processingMessage,
  inputMode,
  scriptToRead
}: UserDataInputProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { 
    isRecording, 
    startRecording, 
    stopRecording, 
    audioBlob, 
    audioUrl,
    setAudioUrl,
    setAudioBlob 
  } = useVoiceRecorder()

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleConfirmImage = () => {
    if (selectedImage && onImageUpload) {
      onImageUpload(selectedImage)
    }
  }

  const handleConfirmVoice = () => {
    if (audioBlob && onVoiceRecording) {
      onVoiceRecording(audioBlob)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-6 py-4">
      {inputMode === 'image' && (
        <>
          <h2 className="text-xl font-semibold text-gray-800">사진 업로드</h2>
          <p className="text-gray-600 text-center px-4">
            딥페이크 영상 생성을 위해 얼굴이 명확하게 보이는 사진을 업로드해주세요.
          </p>
          
          <div className="w-full max-w-xs sm:max-w-sm">
            <div 
              className="aspect-square border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors flex items-center justify-center bg-gray-50"
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="max-h-full max-w-full object-contain rounded-md"
                />
              ) : (
                <div className="text-gray-500 flex flex-col items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p>클릭하여 사진 선택</p>
                  <p className="text-xs mt-1">(JPG, PNG)</p>
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/jpeg,image/png"
              className="hidden"
            />
          </div>

          <button
            onClick={handleConfirmImage}
            disabled={!selectedImage || isProcessing}
            className={`w-full max-w-xs sm:max-w-sm px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
              !selectedImage || isProcessing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isProcessing ? (processingMessage || '처리 중...') : '이 사진으로 결정'}
          </button>
        </>
      )}

      {inputMode === 'voice' && (
        <>
          <h2 className="text-xl font-semibold text-gray-800">음성 녹음</h2>
          
          {scriptToRead && (
            <div className="w-full max-w-md p-4 border border-gray-200 rounded-lg bg-gray-50 mb-3">
              <p className="text-sm font-medium text-gray-700 mb-1">아래 스크립트를 읽어주세요:</p>
              <p className="text-gray-600 whitespace-pre-line leading-relaxed">{scriptToRead}</p>
            </div>
          )}

          <p className="text-gray-600 text-center px-4">
            딥페이크 영상에 사용될 음성을 녹음해주세요. 아래 버튼을 눌러 녹음을 시작하세요.
          </p>

          <div className="w-full max-w-xs sm:max-w-sm space-y-4">
            {audioUrl && !isRecording ? (
              <div className="space-y-3 flex flex-col items-center">
                <audio src={audioUrl} controls className="w-full rounded-md" />
                <button
                  onClick={() => {
                    setAudioUrl(null)
                    setAudioBlob(null)
                    setSelectedImage(null)
                    setImagePreview(null)
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium py-1"
                >
                  다시 녹음하기
                </button>
              </div>
            ) : (
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-full py-3 rounded-lg font-semibold text-white transition-colors flex items-center justify-center space-x-2 ${
                  isRecording
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isRecording ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9h6v6H9z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
                <span>{isRecording ? '녹음 중지' : '녹음 시작'}</span>
              </button>
            )}
            {isRecording && <p className="text-sm text-center text-red-500 animate-pulse">녹음 진행 중...</p>}
          </div>

          <button
            onClick={handleConfirmVoice}
            disabled={!audioBlob || isProcessing || isRecording}
            className={`w-full max-w-xs sm:max-w-sm px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
              !audioBlob || isProcessing || isRecording
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isProcessing ? (processingMessage || '처리 중...') : '이 음성으로 결정'}
          </button>
        </>
      )}

      {isProcessing && inputMode === 'image' && processingMessage && (
        <div className="w-full max-w-xs sm:max-w-sm mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <p className="text-blue-700 text-sm">{processingMessage}</p>
        </div>
      )}
      {isProcessing && inputMode === 'voice' && processingMessage && (
        <div className="w-full max-w-xs sm:max-w-sm mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <p className="text-blue-700 text-sm">{processingMessage}</p>
        </div>
      )}
    </div>
  )
} 
'use client'

interface EducationalVideoProps {
  videoUrl: string;
  onComplete: () => void;
  userName: string;
  showNextButton?: boolean;
  onNextButtonClick?: () => void;
}

export default function EducationalVideo({ 
  videoUrl, 
  onComplete, 
  userName, 
  showNextButton, 
  onNextButtonClick 
}: EducationalVideoProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
      <h2 className="text-2xl font-semibold mb-4"> 원본 영상을 시청해주세요!</h2>
      <p className="mb-4 text-gray-700">
        이 영상은 딥페이크 기술의 이해를 돕기 위한 원본 교육 영상입니다. 시청 후 "다음으로" 버튼을 눌러주세요.
      </p>
      <div className="aspect-w-16 aspect-h-9 mb-4">
        <video
          src={videoUrl}
          controls
          onEnded={onComplete}
          className="w-full rounded"
          onError={(e) => console.error("Video player error:", e)}
        />
      </div>
      {showNextButton && (
        <button
          onClick={onNextButtonClick}
          className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors duration-150"
        >
          다음으로
        </button>
      )}
      {!showNextButton && (
        <p className="text-sm text-gray-500 mt-4">영상을 모두 시청하시면 다음으로 진행할 수 있습니다.</p>
      )}
    </div>
  );
} 
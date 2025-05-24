'use client'

interface ListenToClonedVoiceProps {
  audioUrl: string | null;
  onComplete: () => void;
  isProcessing: boolean; // To disable button if parent is still processing
  processingMessage: string | null;
  userName: string;
}

export default function ListenToClonedVoice({
  audioUrl,
  onComplete,
  isProcessing,
  processingMessage,
  userName
}: ListenToClonedVoiceProps) {
  if (isProcessing && !audioUrl) {
    return (
      <div className="text-center p-4">
        <h3 className="text-xl font-semibold mb-3">{userName}님의 목소리로 스크립트 음성 생성 중...</h3>
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto my-4"></div>
        <p className="text-gray-600 min-h-[20px]">{processingMessage || "잠시만 기다려주세요..."}</p>
      </div>
    );
  }

  if (!audioUrl) {
    return (
      <div className="text-center p-4">
        <h3 className="text-xl font-semibold mb-3 text-red-600">스크립트 음성을 준비하지 못했습니다.</h3>
        <p className="text-gray-700 mb-4">오류로 인해 {userName}님의 목소리로 스크립트 음성을 생성하지 못했습니다.</p>
        <p className="text-gray-600 mb-6">다음 버튼을 눌러 딥페이크 영상 생성 단계로 바로 진행할 수 있습니다.</p>
        <button
          onClick={onComplete}
          className="w-full max-w-xs sm:max-w-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-150"
        >
          다음 단계로 (딥페이크 영상 생성)
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
      <h2 className="text-2xl font-semibold mb-4">{userName}님의 목소리 확인</h2>
      <p className="mb-2 text-gray-700">
        아래 음성은 방금 녹음하고 복제한 {userName}님의 목소리로 생성된 스크립트입니다.
      </p>
      <p className="mb-6 text-gray-500 text-sm">
        (이 음성은 다음 단계의 딥페이크 영상에 사용되지 않으며, 목소리 복제 결과 확인용입니다.)
      </p>
      <div className="my-6 w-full max-w-md mx-auto">
        <audio src={audioUrl} controls className="w-full rounded-md shadow" />
      </div>
      <button
        onClick={onComplete}
        disabled={isProcessing} // Disable if any parent processing is still marked
        className={`w-full max-w-xs sm:max-w-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-150 ${
          isProcessing ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {isProcessing ? "처리 중..." : "잘 들었습니다, 다음으로"}
      </button>
    </div>
  );
} 
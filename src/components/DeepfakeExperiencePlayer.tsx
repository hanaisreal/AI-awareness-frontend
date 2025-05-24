'use client'
import { useState, useRef, useEffect } from 'react'

interface DeepfakeExperiencePlayerProps {
  videoUrl: string | null;
  // introAudioUrl?: string | null; // Removed for simplification in this step
  isLoading: boolean; // isLoading from parent (e.g. if page.tsx determines overall loading state)
  error: string | null; // error from parent
  // pollingMessage?: string | null; // Removed, parent should handle this message display
  onNext: () => void;
}

export default function DeepfakeExperiencePlayer({
  videoUrl,
  // introAudioUrl, // Removed
  isLoading: parentIsLoading,
  error: parentError,
  // pollingMessage, // Removed
  onNext
}: DeepfakeExperiencePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [internalLoading, setInternalLoading] = useState(true); // Tracks video element's loading state
  const [internalError, setInternalError] = useState<string | null>(null);

  useEffect(() => {
    // Prioritize parent error
    if (parentError) {
      setInternalError(parentError);
      setInternalLoading(false);
      return;
    }
    // If no parent error, clear internal error if videoUrl changes (allows retry)
    setInternalError(null);

    const videoElement = videoRef.current;
    if (videoElement && videoUrl) {
      console.log("DFEP: videoUrl prop received:", videoUrl);
      setInternalLoading(true); // Expect loading to start
    } else if (!videoUrl) {
      if(!parentIsLoading) setInternalLoading(false);
    }
  }, [videoUrl, parentError]); // Rerun when videoUrl or parentError changes

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const videoElement = e.currentTarget;
    const error = videoElement.error;
    let errorMessage = '동영상 재생 중 오류가 발생했습니다.';
    
    if (error) {
      switch (error.code) {
        case MediaError.MEDIA_ERR_ABORTED:  errorMessage = '영상 재생이 중단되었습니다.'; break;
        case MediaError.MEDIA_ERR_NETWORK:  errorMessage = '네트워크 문제로 영상 로딩에 실패했습니다.'; break;
        case MediaError.MEDIA_ERR_DECODE:   errorMessage = '영상 디코딩에 실패했습니다. 파일 형식을 확인해주세요.'; break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = '영상 형식을 지원하지 않거나 파일을 찾을 수 없습니다.';
          console.error('DFEP: Video URL that failed:', videoUrl);
          break;
        default: errorMessage = `알 수 없는 미디어 오류입니다 (코드: ${error.code}).`;
      }
    }
    console.error('DFEP: Video error:', errorMessage, error);
    setInternalError(errorMessage);
    setInternalLoading(false);
  };

  const handleCanPlay = () => {
    console.log("DFEP: Video can play.");
    setInternalLoading(false);
    // Attempt to play if autoplay is desired and not already handled by attribute
    // videoRef.current?.play().catch(e => console.warn("DFEP: Autoplay onCanPlay failed", e));
  };

  const handleLoadedData = () => {
    console.log("DFEP: Video loaded data.");
    setInternalLoading(false);
  };

  const handleLoadStart = () => {
    console.log("DFEP: Video load start.");
    setInternalLoading(true);
    setInternalError(null); // Clear previous errors on new load attempt
  };

  const displayError = parentError || internalError;
  // isLoading should consider parentIsLoading for overall page state, and internalLoading for video element state.
  const effectiveIsLoading = parentIsLoading || (internalLoading && !!videoUrl && !displayError);

  return (
    <div className="flex flex-col items-center space-y-4 w-full p-4 bg-gray-50 rounded-lg shadow-md">
      <div className="w-full max-w-xl aspect-video bg-black rounded-md overflow-hidden relative">
        {displayError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 bg-opacity-95 p-4 z-20">
            <p className="text-red-400 font-semibold text-lg mb-2">! 오류 발생 !</p>
            <p className="text-white text-center text-sm">{displayError}</p>
          </div>
        )}

        {effectiveIsLoading && !displayError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 bg-opacity-70 z-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-400"></div>
            <p className="text-white mt-3 text-sm">딥페이크 영상 준비 중...</p>
          </div>
        )}

        {/* Video Player (plays if stage allows and no error/loading overlay) */} 
        {/* Render video tag if videoUrl is provided, even if loading/error, so events can fire */} 
        {videoUrl && (
          <video
            ref={videoRef}
            key={videoUrl}
            className={`w-full h-full ${!effectiveIsLoading && !displayError ? 'block' : 'hidden'}`}
            controls
            autoPlay
            preload="auto"
            onLoadedData={handleLoadedData}
            onCanPlay={handleCanPlay}
            onError={handleVideoError}
            onLoadStart={handleLoadStart}
          >
            <source src={videoUrl} type="video/mp4" />
            <source src={videoUrl} type="video/x-m4v" />
            죄송합니다. 브라우저에서 비디오를 지원하지 않습니다.
          </video>
        )}
        
        {!videoUrl && !effectiveIsLoading && !displayError && (
             <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-gray-400">체험 영상이 아직 준비되지 않았습니다.</p>
            </div>
        )}
      </div>

      <button
        onClick={onNext}
        disabled={effectiveIsLoading || !!displayError}
        className={`w-full max-w-xs mt-4 px-6 py-3 rounded-lg font-semibold text-white transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
          (effectiveIsLoading || !!displayError)
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        다음 단계로 이동
      </button>
    </div>
  );
} 
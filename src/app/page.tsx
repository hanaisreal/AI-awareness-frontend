'use client'
import { useState, useEffect, useCallback } from 'react'
import UserDataInput from '@/components/UserDataInput'
import EducationalVideo from '@/components/EducationalVideo'
import DeepfakeExperiencePlayer from '@/components/DeepfakeExperiencePlayer'
import ReflectionForm from '@/components/ReflectionForm'
import { uploadVoice, initiateFaceswapVideo, getFaceswapVideoStatus, getElevenLabsIntroAudio } from '@/lib/api'
import ListenToClonedVoice from '@/components/ListenToClonedVoice'

const POLLING_INTERVAL = 5000; // 5 seconds
const MAX_POLLS = 60; // 5 minutes max polling
const ELEVEN_LABS_NARRATOR_TEXT = "딥페이크 영상은 누구나 손쉽게 만들 수 있는데요.";
const USER_VOICE_SCRIPT = "여보세요? 이번에 건강검진 예약해놨거든? 그런데 거기서 주민등록증 사본이랑 건강보험증 필요하다고 하네. 그거 사진 찍어서 지금 좀 보내줄 수 있어? 급하니까 빨리!!";
const RECORDING_SCRIPT_KOREAN = "안녕하세요. 지금 제 목소리를 녹음하고 있습니다. 이 목소리가 어떻게 복제될지 기대되네요.";
const MIN_POLLS_FOR_STATUS_2_SUCCESS = 3;

const AKOOL_API_KEY = process.env.NEXT_PUBLIC_AKOOL_API_KEY;

export default function Home() {
  const [currentView, setCurrentView] = useState('welcome');
  const [step, setStep] = useState(1);
  const [userImageFile, setUserImageFile] = useState<File | null>(null);
  const [userClonedVoiceId, setUserClonedVoiceId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("참여자");
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  // const [narratorIntroAudioUrl, setNarratorIntroAudioUrl] = useState<string | null>(null); // Removed
  const [userScriptAudioUrl, setUserScriptAudioUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false); // General processing for non-Akool async tasks
  const [processingMessage, setProcessingMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [akoolTaskId, setAkoolTaskId] = useState<string | null>(null); // For Akool video polling
  const [pollCount, setPollCount] = useState(0);
  const [pollingMessage, setPollingMessage] = useState<string | null>(null); // Specific for video polling status updates

  const [showNextButtonAfterEduVideo, setShowNextButtonAfterEduVideo] = useState(false);

  console.log("[Home Render] Step:", step, "isProcessing:", isProcessing, "akoolTaskId:", akoolTaskId, "genURL:", generatedVideoUrl, "pollCount:", pollCount, "processingMsg:", processingMessage, "pollingMsg:", pollingMessage, "error:", error);

  // Step 1: Handle Image Upload AND Initiate Faceswap
  const handleImageUploadComplete = async (imageFile: File) => {
    setUserImageFile(imageFile);
    setError(null); 
    setProcessingMessage("사진 업로드 완료. 백그라운드에서 얼굴 변환 영상 생성을 시작합니다...");
    handleInitiateFaceswapEarly(imageFile); 
    setProcessingMessage("음성 녹음 및 복제 단계로 이동합니다."); 
    setStep(2);
  };

  const handleInitiateFaceswapEarly = async (imageFile: File) => {
    console.log("[handleInitiateFaceswapEarly] Initiating faceswap early.");
    setGeneratedVideoUrl(null); 
    setAkoolTaskId(null);       
    setPollCount(0);            
    setPollingMessage("얼굴 변환 영상 초기화 중..."); 

    try {
      const faceswapResponse = await initiateFaceswapVideo(imageFile);
      console.log("[handleInitiateFaceswapEarly] Faceswap API Response:", faceswapResponse);

      if (faceswapResponse.direct_url) {
        console.log("[handleInitiateFaceswapEarly] Akool provided direct URL:", faceswapResponse.direct_url);
        const backendStreamUrl = `/api/stream-video?url=${encodeURIComponent(faceswapResponse.direct_url)}`;
        setGeneratedVideoUrl(backendStreamUrl);
        setPollingMessage("얼굴 변환 영상이 즉시 준비되었습니다."); 
        setAkoolTaskId(null); 
      } else if (faceswapResponse.akool_task_id) {
        setAkoolTaskId(faceswapResponse.akool_task_id);
        setPollingMessage(faceswapResponse.message || "얼굴 변환 영상 생성 작업 시작됨. 백그라운드에서 상태를 확인합니다...");
      } else {
        throw new Error(faceswapResponse.details || "얼굴 변환 영상 생성 시작 실패 (Task ID 또는 직접 URL 없음)");
      }
    } catch (err: any) {
      console.error("[handleInitiateFaceswapEarly] Faceswap initiation failed:", err);
      const earlyFaceswapError = "백그라운드 얼굴 변환 시작 실패: " + (err.message || "알 수 없는 오류");
      setError((prevError) => prevError ? `${prevError}; ${earlyFaceswapError}` : earlyFaceswapError);
      setPollingMessage(earlyFaceswapError); 
      setAkoolTaskId(null); 
    }
  };

  // Step 2: Handle Voice Recording and Cloning
  const handleVoiceRecordedAndClone = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setProcessingMessage("음성 파일 업로드 및 복제 중...");
    setError(null);
    try {
      const fileName = `${userName}_voice_${Date.now()}.webm`;
      const voiceId = await uploadVoice(audioBlob, fileName);
      if (voiceId && typeof voiceId === 'string') {
        setUserClonedVoiceId(voiceId);
        setProcessingMessage("음성 복제 완료. 다음은 원본 교육 영상 시청 단계입니다.");
        setStep(3);
      } else {
        throw new Error("음성 복제 후 유효한 voiceId를 받지 못했습니다.");
      }
    } catch (err: any) {
      console.error("Voice cloning failed:", err);
      setError("음성 복제 실패: " + (err.message || "알 수 없는 오류"));
      setProcessingMessage("음성 복제에 실패했습니다. 다시 시도해주세요.");
    }
    setIsProcessing(false);
  };

  // Step 3: Educational Video Completion
  const handleEducationalVideoComplete = () => {
    setShowNextButtonAfterEduVideo(true);
  };

  const handleProceedToListenClonedVoice = async () => {
    if (!userClonedVoiceId) {
      setError("복제된 음성 ID가 없어 사용자 스크립트 음성을 생성할 수 없습니다. 2단계 음성 복제를 확인해주세요.");
      setStep(2); 
      return;
    }
    setIsProcessing(true); 
    setError(null);
    setProcessingMessage("사용자 스크립트 음성 생성 중...");
    setUserScriptAudioUrl(null); 

    try {
      const scriptAudioResponse = await getElevenLabsIntroAudio(USER_VOICE_SCRIPT, userClonedVoiceId);
      if (scriptAudioResponse && scriptAudioResponse.audioUrl) {
        setUserScriptAudioUrl(scriptAudioResponse.audioUrl);
        setProcessingMessage(null); 
        setStep(4); 
      } else {
        throw new Error("사용자 스크립트 음성 URL을 받지 못했습니다.");
      }
    } catch (err: any) {
      console.error("[handleProceedToListenClonedVoice] User script audio generation failed:", err);
      setError("사용자 스크립트 음성 생성 실패: " + (err.message || "알 수 없는 오류"));
      setProcessingMessage("사용자 스크립트 음성 생성에 실패했습니다.");
    }
    setIsProcessing(false);
  };

  const handlePrepareDeepfakeScenario = async () => {
    // Called after Step 4. Faceswap initiated in Step 1. No narrator audio generation.
    console.log("[handlePrepareDeepfakeScenario] Preparing for Step 5: Deepfake video display status.");
    setStep(5); 
    // No specific 'isProcessing' state set here as major async work (Akool) is background polled.
    
    if (generatedVideoUrl) { 
      setProcessingMessage("딥페이크 영상 준비 완료.");
    } else if (akoolTaskId) { 
      setProcessingMessage("딥페이크 영상 백그라운드 생성 중...");
    } else if (!error) { 
        const missingVideoError = "딥페이크 영상 정보를 찾을 수 없습니다. 1단계 이미지 업로드부터 다시 시도해주세요.";
        setError((prevError) => prevError ? `${prevError}; ${missingVideoError}` : missingVideoError);
        setProcessingMessage(missingVideoError);
    } else {
        // An error (e.g. from early faceswap) already exists.
        // processingMessage might be set by early error, or pollingMessage by polling error.
        if (!processingMessage && !pollingMessage && error) { // If error exists but no specific message is showing
             setProcessingMessage("오류 발생. 상세 내용을 확인해주세요.");
        } else if (!processingMessage && !pollingMessage && !error) { // Default, if no video, no task, no error
            setProcessingMessage("딥페이크 영상 상태를 확인 중입니다...");
        }
    }
  };
  
  const pollVideoStatus = useCallback(async () => {
    if (!akoolTaskId) return;

    const currentPollAttempt = pollCount + 1; 
    setPollCount(c => c + 1); 

    console.log(`[pollVideoStatus] Polling attempt ${currentPollAttempt}/${MAX_POLLS} for task ${akoolTaskId}`);
    setPollingMessage(`얼굴 변환 영상 상태 확인 중... (시도 ${currentPollAttempt}/${MAX_POLLS})`);

    try {
      const statusResponse = await getFaceswapVideoStatus(akoolTaskId);
      const statusDetails = statusResponse.status_details;
      console.log(`[pollVideoStatus] Akool Status Response (Attempt ${currentPollAttempt}):`, statusDetails);

      const isSuccessStatus3 = statusDetails.faceswap_status === 3 && statusDetails.url;
      const isPotentialSuccessStatus2 =
        statusDetails.faceswap_status === 2 &&
        statusDetails.url &&
        currentPollAttempt >= MIN_POLLS_FOR_STATUS_2_SUCCESS;

      if (isSuccessStatus3 || isPotentialSuccessStatus2) {
        const backendStreamUrl = `/api/stream-video?url=${encodeURIComponent(statusDetails.url!)}`;
        setGeneratedVideoUrl(backendStreamUrl);
        setPollingMessage("딥페이크 영상 생성 완료.");
        setAkoolTaskId(null); 
      } else if (statusDetails.faceswap_status === 4) { 
        const videoGenError = "딥페이크 영상 생성 실패 (Akool 서버 오류): " + (statusDetails.msg || "알 수 없는 오류");
        setError((prevError) => prevError ? `${prevError}; ${videoGenError}` : videoGenError);
        setPollingMessage(videoGenError);
        setAkoolTaskId(null); 
      } else if (currentPollAttempt >= MAX_POLLS) { 
        const timeoutError = "딥페이크 영상 생성 시간 초과";
        setError((prevError) => prevError ? `${prevError}; ${timeoutError}` : timeoutError);
        setPollingMessage(timeoutError);
        setAkoolTaskId(null); 
      } else { 
        const statusKey = statusDetails.faceswap_status;
        const statusText = (statusKey === 0) ? "대기 중" : (statusKey === 1 || statusKey === 2) ? "영상 처리 중" : `알 수 없는 상태 ${statusKey}`;
        console.log(`[pollVideoStatus] Akool Task ${akoolTaskId} still processing. Status: ${statusKey} (${statusText}).`);
        // Polling message updated at the start of the function.
      }
    } catch (err: any) {
      const pollErrorMsg = "딥페이크 영상 상태 확인 중 API 오류 발생: " + (err.message || "알 수 없는 네트워크 오류");
      setError((prevError) => prevError ? `${prevError}; ${pollErrorMsg}` : pollErrorMsg);
      setPollingMessage(pollErrorMsg);
      setAkoolTaskId(null); 
    }
  }, [akoolTaskId, pollCount]); // Removed unnecessary dependencies

  useEffect(() => { // Akool Video Polling Effect
    let intervalId: NodeJS.Timeout | null = null;
    if (currentView === 'app' && akoolTaskId && !generatedVideoUrl && pollCount < MAX_POLLS) {
      if (pollCount === 0) { 
         pollVideoStatus(); 
      }
      intervalId = setInterval(pollVideoStatus, POLLING_INTERVAL);
    }
    return () => { 
      if (intervalId) clearInterval(intervalId);
    };
  }, [currentView, akoolTaskId, generatedVideoUrl, pollCount, pollVideoStatus]);

  useEffect(() => { // Transition from Step 5 to Step 6
    if (step === 5 && generatedVideoUrl) {
      console.log("[useEffect Step5->6] Video ready. Moving to Step 6.");
      setProcessingMessage(null); 
      // Keep error if it's a video generation error, otherwise, it might be cleared if not relevant to step 6
      setStep(6);
    }
  }, [step, generatedVideoUrl]);


  const currentAppProgressStep = () => {
    if (currentView !== 'app') return 0;
    return step;
  }
  const totalAppSteps = 7;

  const appStepTitles = [
    "1. 사진 업로드",
    "2. 음성 녹음/복제",
    "3. 원본 영상 시청",
    "4. 복제 음성 확인",
    "5. 딥페이크 생성 중",
    "6. 딥페이크 체험",
    "7. 성찰하기"
  ];

  const appStepComponents: { [key: number]: JSX.Element | null } = {
    1: <UserDataInput
        key="image-upload"
        onImageUpload={handleImageUploadComplete}
        isProcessing={isProcessing && step === 1}
        processingMessage={step === 1 ? processingMessage : null}
        inputMode="image"
       />,
    2: <UserDataInput
        key="voice-upload"
        onVoiceRecording={handleVoiceRecordedAndClone}
        isProcessing={isProcessing && step === 2}
        processingMessage={step === 2 ? processingMessage : null}
        inputMode="voice"
        scriptToRead={RECORDING_SCRIPT_KOREAN}
       />,
    3: (() => {
        let eduVideoUrl = process.env.NEXT_PUBLIC_EDUCATIONAL_VIDEO_URL || "/sample_educational_video.mp4";
        if (eduVideoUrl.startsWith('http') && typeof window !== 'undefined' && !eduVideoUrl.includes(window.location.hostname) ) { 
          eduVideoUrl = `/api/stream-video?url=${encodeURIComponent(eduVideoUrl)}`;
        }
        return (
          <EducationalVideo
                key="edu-video"
                videoUrl={eduVideoUrl}
                userName={userName}
                onComplete={handleEducationalVideoComplete}
                showNextButton={showNextButtonAfterEduVideo}
                onNextButtonClick={handleProceedToListenClonedVoice}
              />
        );
      })(),
    4: <ListenToClonedVoice
        key="listen-cloned-voice"
        audioUrl={userScriptAudioUrl}
        userName={userName}
        isProcessing={isProcessing && step === 4 && !userScriptAudioUrl} 
        processingMessage={step === 4 && isProcessing ? processingMessage : null}
        onComplete={handlePrepareDeepfakeScenario} 
       />,
    5: <div className="text-center p-4">
          <h3 className="text-xl font-semibold mb-3">{appStepTitles[4]}</h3> {/* 딥페이크 생성 중 */}
          {!generatedVideoUrl && 
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto my-4"></div>
          }
          <p className="text-gray-600 min-h-[40px] mt-2">
            {pollingMessage && !generatedVideoUrl ? pollingMessage : 
             (processingMessage || (generatedVideoUrl ? "딥페이크 영상 준비 완료!" : "잠시만 기다려주세요..."))}
          </p>
          {generatedVideoUrl && <p className="text-green-600 mt-2">잠시 후 체험이 시작됩니다.</p>}
        </div>,
    6: <DeepfakeExperiencePlayer
        key="deepfake-experience"
        videoUrl={generatedVideoUrl}
        isLoading={!generatedVideoUrl && step === 6}
        error={error}
        onNext={() => { setError(null); setStep(7);}}
       />,
    7: <ReflectionForm />
  };

  const renderAppView = () => (
    <>
      <div className="mb-6 md:mb-8">
        <div className="flex justify-between items-end mb-1">
          {appStepTitles.map((title, index) => {
            const stepNumber = index + 1;
            const isCompleted = currentAppProgressStep() > stepNumber;
            const isActive = currentAppProgressStep() === stepNumber;
  return (
              <div key={title} className={`flex flex-col items-center text-center flex-grow ${index > 0 ? 'ml-1 sm:ml-2' : ''}`}>
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm border-2 font-medium ${isCompleted ? 'bg-green-500 border-green-600 text-white' : isActive ? 'bg-blue-600 border-blue-700 text-white' : 'bg-gray-100 border-gray-300 text-gray-500'}`}>
                  {stepNumber}
                </div>
                <span className={`mt-1.5 text-[10px] sm:text-xs leading-tight ${isActive || isCompleted ? 'text-blue-700 font-semibold' : 'text-gray-500'}`}>{title}</span>
              </div>
            );
          })}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out" style={{ width: `${(currentAppProgressStep() / totalAppSteps) * 100}%` }}></div>
        </div>
        {(error && step !==4 && step !==6 ) && (
          <div className={`mt-4 p-3 rounded-md text-sm bg-red-100 border-red-400 text-red-700`}>
            오류: {error}
          </div>
        )}
        {isProcessing && processingMessage && ![1,2,4].includes(step) && (step !== 5 || (step === 5 && !pollingMessage && !generatedVideoUrl)) && ( 
            <div className={`mt-4 p-3 rounded-md text-sm bg-blue-100 border-blue-400 text-blue-700`}>
                {processingMessage}
            </div>
        )}
      </div>
      <div className="mt-6 min-h-[350px]">
        {appStepComponents[step as keyof typeof appStepComponents]}
      </div>
    </>
  );

  if (currentView === 'welcome') {
    return (
      <main className="min-h-screen bg-slate-50 p-4 flex flex-col items-center justify-center font-sans">
        <div className="w-full max-w-lg bg-white shadow-xl rounded-lg p-8 text-center">
          <h1 className="text-3xl font-bold mb-5 text-slate-800">안녕하세요!</h1>
          <p className="text-lg mb-8 text-slate-600">AI 딥페이크 위험성 알림 및 체험 프로그램에 오신 것을 환영합니다.</p>
          <button onClick={() => setCurrentView('explanation')} className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-150">
            다음으로
          </button>
        </div>
        <footer className="mt-8 text-xs text-gray-500">&copy; {new Date().getFullYear()} AI Awareness Project.</footer>
      </main>
    );
  }

  if (currentView === 'explanation') {
    return (
      <main className="min-h-screen bg-slate-50 p-4 flex flex-col items-center justify-center font-sans">
        <div className="w-full max-w-lg bg-white shadow-xl rounded-lg p-8 text-left">
          <h2 className="text-2xl font-semibold mb-5 text-slate-800">프로그램 안내</h2>
          <div className="space-y-3 text-slate-600 text-base">
            <p>이 프로그램은 AI 딥페이크 기술의 위험성을 알리고, 직접 체험을 통해 그 위험성을 인지하도록 돕기 위해 만들어졌습니다.</p>
            <p>총 {totalAppSteps}단계로 진행되며, 다음 순서로 구성됩니다:</p>
            <ul className="list-decimal list-inside ml-4 space-y-1">
              {appStepTitles.map(title => <li key={title}>{title.substring(title.indexOf(" ") + 1)}</li>)}
            </ul>
            <p className="pt-3">준비되셨다면, 아래 버튼을 눌러 체험을 시작해주세요.</p>
          </div>
          <button onClick={() => { setCurrentView('app'); setStep(1); setError(null); setProcessingMessage(null); setGeneratedVideoUrl(null); setAkoolTaskId(null); setPollCount(0); setPollingMessage(null); }} className="w-full mt-8 px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-150">
            체험 시작하기
          </button>
        </div>
        <footer className="mt-8 text-xs text-gray-500">&copy; {new Date().getFullYear()} AI Awareness Project.</footer>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 flex flex-col items-center font-sans">
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-slate-800">
          AI 딥페이크 위험성 알림 및 체험
        </h1>
        {renderAppView()}
      </div>
      <footer className="mt-8 mb-4 text-xs text-gray-500">&copy; {new Date().getFullYear()} AI Awareness Project. All rights reserved.</footer>
    </main>
  );
}
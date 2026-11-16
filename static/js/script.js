/**
 * TruthLens AI — Deep Learning Fake News Detection Frontend Logic
 * Connects to Flask backend POST /predict
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM References ---
  const newsInput = document.getElementById('newsInput');
  const textareaContainer = document.getElementById('textareaContainer');
  const inlineError = document.getElementById('inlineError');
  const inlineErrorMsg = document.getElementById('inlineErrorMsg');
  const wordCount = document.getElementById('wordCount');
  const charCount = document.getElementById('charCount');
  const readingTime = document.getElementById('readingTime');

  // Action Buttons
  const analyzeBtn = document.getElementById('analyzeBtn');
  const btnIcon = document.getElementById('btnIcon');
  const btnSpinner = document.getElementById('btnSpinner');
  const btnText = document.getElementById('btnText');
  const clearBtn = document.getElementById('clearBtn');
  const pasteBtn = document.getElementById('pasteBtn');
  const sampleRealBtn = document.getElementById('sampleRealBtn');
  const sampleFakeBtn = document.getElementById('sampleFakeBtn');
  const copyReportBtn = document.getElementById('copyReportBtn');
  const copyReportText = document.getElementById('copyReportText');
  const resetBtn = document.getElementById('resetBtn');
  const retryBtn = document.getElementById('retryBtn');

  // Result States
  const standbyState = document.getElementById('standbyState');
  const loadingState = document.getElementById('loadingState');
  const resultState = document.getElementById('resultState');
  const errorState = document.getElementById('errorState');
  const apiErrorMessage = document.getElementById('apiErrorMessage');

  // Result Elements
  const verdictBanner = document.getElementById('verdictBanner');
  const verdictIcon = document.getElementById('verdictIcon');
  const verdictTag = document.getElementById('verdictTag');
  const verdictTitle = document.getElementById('verdictTitle');
  const verdictSummary = document.getElementById('verdictSummary');
  const confidenceValue = document.getElementById('confidenceValue');
  const confidenceGrade = document.getElementById('confidenceGrade');
  const confidenceBar = document.getElementById('confidenceBar');
  const telemetryLabel = document.getElementById('telemetryLabel');
  const inferenceTime = document.getElementById('inferenceTime');
  const findingsText = document.getElementById('findingsText');

  // History Elements
  const historyList = document.getElementById('historyList');
  const historyEmpty = document.getElementById('historyEmpty');
  const historyCount = document.getElementById('historyCount');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');

  // Modal Elements
  const infoModal = document.getElementById('infoModal');
  const openModalBtn = document.getElementById('openModalBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const closeModalFooterBtn = document.getElementById('closeModalFooterBtn');

  // Toast Container
  const toastContainer = document.getElementById('toastContainer');

  // --- State Variables ---
  let lastAnalyzedText = '';
  let sessionHistory = [];
  let isAnalyzing = false;
  let loadingInterval = null;

  // --- Sample News Dataset ---
  const SAMPLE_REAL = `WASHINGTON — The National Aeronautics and Space Administration (NASA) announced on Tuesday that the James Webb Space Telescope has detected compelling spectroscopic signatures of carbon dioxide and sulfur compounds in the atmosphere of an exoplanet located 700 light-years away in the constellation Pegasus.

According to researchers who published their peer-reviewed findings in the Astrophysical Journal, the observations represent the most detailed chemical inventory ever assembled for a distant world. "These high-resolution infrared measurements provide definitive proof of photochemistry occurring outside our solar system," stated the principal investigator. Independent astrophysicists confirmed the methodology aligns with established calibration standards.`;

  const SAMPLE_FAKE = `BREAKING: Secret underground lab discovers miraculous plant extract that cures all human illnesses within 48 hours, but international pharmaceutical executives are bribing governments worldwide to outlaw and incinerate every crop immediately!

Whistleblowers report that drinking this simple daily tea completely reverses cellular aging and eliminates chronic diseases permanently without doctors or prescription drugs. Mainstream media networks are under strict gag orders not to report on this forbidden miracle cure. Share this urgent message with everyone you know before the internet censors delete this page permanently!`;

  // --- Helper: Update Text Statistics ---
  function updateTextStats() {
    const text = newsInput.value.trim();
    const chars = newsInput.value.length;
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const readTime = Math.ceil(words / 200);

    charCount.textContent = chars.toLocaleString();
    wordCount.textContent = words.toLocaleString();
    readingTime.textContent = readTime;

    if (text.length > 0 && !inlineError.classList.contains('hidden')) {
      hideInlineError();
    }
  }

  // --- Helper: Inline Error Toggle ---
  function showInlineError(msg) {
    inlineErrorMsg.textContent = msg;
    inlineError.classList.remove('hidden');
    newsInput.classList.add('invalid');
  }

  function hideInlineError() {
    inlineError.classList.add('hidden');
    newsInput.classList.remove('invalid');
  }

  // --- Helper: Toast Notification ---
  function showToast(message, type = 'info', duration = 3500) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'error') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    } else if (type === 'success') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    } else {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `${iconSvg}<span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // --- Switch Result Card View States ---
  function switchState(stateName) {
    standbyState.classList.add('hidden');
    loadingState.classList.add('hidden');
    resultState.classList.add('hidden');
    errorState.classList.add('hidden');

    if (stateName === 'standby') standbyState.classList.remove('hidden');
    else if (stateName === 'loading') loadingState.classList.remove('hidden');
    else if (stateName === 'result') resultState.classList.remove('hidden');
    else if (stateName === 'error') errorState.classList.remove('hidden');
  }

  // --- Step-by-step loading animation simulator ---
  function startLoadingSteps() {
    const steps = [
      document.getElementById('step1'),
      document.getElementById('step2'),
      document.getElementById('step3'),
      document.getElementById('step4')
    ];

    steps.forEach((s, idx) => {
      s.className = idx === 0 ? 'loading-step active' : 'loading-step';
    });

    let current = 0;
    loadingInterval = setInterval(() => {
      current++;
      if (current < steps.length) {
        steps[current].classList.add('active');
        steps[current].querySelector('.step-icon').textContent = '⟳';
        if (current > 0) {
          steps[current - 1].querySelector('.step-icon').textContent = '✔';
        }
      }
    }, 280);
  }

  function stopLoadingSteps() {
    if (loadingInterval) {
      clearInterval(loadingInterval);
      loadingInterval = null;
    }
  }

  // --- Count-up animation for Confidence number ---
  function animateConfidence(targetVal, duration = 900) {
    const startVal = 0;
    const startTime = performance.now();

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = (startVal + (targetVal - startVal) * eased).toFixed(2);
      confidenceValue.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        confidenceValue.textContent = Number(targetVal).toFixed(2);
      }
    }
    requestAnimationFrame(updateCounter);
  }

  // --- Display Prediction Result ---
  function renderResult(prediction, confidence, latency) {
    const isReal = prediction === 'Real News';
    const conf = typeof confidence === 'number' ? confidence : parseFloat(confidence) || 0;

    // Reset styles
    verdictBanner.classList.remove('is-real', 'is-fake');
    confidenceBar.classList.remove('real-fill', 'fake-fill');

    if (isReal) {
      verdictBanner.classList.add('is-real');
      confidenceBar.classList.add('real-fill');
      verdictTag.textContent = 'VERIFIED CREDIBLE ARTICLE';
      verdictTitle.textContent = 'Real News';
      verdictSummary.textContent = 'Linguistic flow, syntax, and phrasing align with authentic factual reporting standards.';
      verdictIcon.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="m9 12 2 2 4-4"/>
        </svg>
      `;

      findingsText.textContent = `The LSTM network observed consistent semantic coherence across 300 token sequences. Neutral lexical patterns and objective sentence transitions yielded a high confidence score of ${conf.toFixed(2)}% in favor of authenticity.`;
    } else {
      verdictBanner.classList.add('is-fake');
      confidenceBar.classList.add('fake-fill');
      verdictTag.textContent = 'POTENTIAL MISINFORMATION DETECTED';
      verdictTitle.textContent = 'Fake News';
      verdictSummary.textContent = 'High probability of fabricated claims, sensationalist rhetoric, or misleading context.';
      verdictIcon.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      `;

      findingsText.textContent = `Sequential gate activations triggered elevated risk indicators. Patterns associated with emotional hyperbole, unverified assertions, or anomalous sentence recurrence yielded a confidence score of ${conf.toFixed(2)}% toward synthetic/fake news.`;
    }

    // Confidence grade descriptor
    if (conf >= 90) {
      confidenceGrade.textContent = 'High Certainty';
    } else if (conf >= 70) {
      confidenceGrade.textContent = 'Moderate Certainty';
    } else {
      confidenceGrade.textContent = 'Low / Borderline';
    }

    // Telemetry
    telemetryLabel.textContent = prediction;
    inferenceTime.textContent = `${latency} ms`;

    // Trigger state change
    switchState('result');

    // Animate counter and progress bar
    animateConfidence(conf);
    setTimeout(() => {
      confidenceBar.style.width = `${Math.min(Math.max(conf, 5), 100)}%`;
    }, 50);

    // Save to session history
    addToHistory(prediction, conf, newsInput.value.trim());
  }

  // --- Session History Management ---
  function addToHistory(prediction, confidence, text) {
    const item = {
      id: Date.now(),
      prediction,
      confidence: Number(confidence).toFixed(2),
      text: text,
      snippet: text.length > 70 ? text.substring(0, 70) + '...' : text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    sessionHistory.unshift(item);
    if (sessionHistory.length > 8) sessionHistory.pop();
    renderHistory();
  }

  function renderHistory() {
    historyCount.textContent = sessionHistory.length;

    if (sessionHistory.length === 0) {
      historyEmpty.style.display = 'block';
      clearHistoryBtn.classList.add('hidden');
      return;
    }

    historyEmpty.style.display = 'none';
    clearHistoryBtn.classList.remove('hidden');

    historyList.querySelectorAll('.history-item').forEach(el => el.remove());

    sessionHistory.forEach(item => {
      const isReal = item.prediction === 'Real News';
      const div = document.createElement('div');
      div.className = 'history-item';
      div.title = 'Click to reload this article into the console';

      div.innerHTML = `
        <div class="history-left">
          <span class="history-tag-badge ${isReal ? 'badge-real' : 'badge-fake'}">${item.prediction}</span>
          <span class="history-snippet">${item.snippet}</span>
        </div>
        <div class="history-right">
          <span class="history-conf">${item.confidence}%</span>
          <span class="history-time">${item.timestamp}</span>
        </div>
      `;

      div.addEventListener('click', () => {
        newsInput.value = item.text;
        updateTextStats();
        hideInlineError();
        window.scrollTo({ top: 150, behavior: 'smooth' });
        showToast('Article reloaded from history. Click Analyze to re-verify.', 'info');
      });

      historyList.appendChild(div);
    });
  }

  // --- Core Action: Analyze News Function ---
  async function performAnalysis() {
    if (isAnalyzing) return;

    const rawText = newsInput.value.trim();

    if (!rawText) {
      showInlineError('Please enter or paste news text before running analysis.');
      newsInput.focus();
      showToast('Article text cannot be empty.', 'error');
      return;
    }

    if (rawText.length < 15) {
      showInlineError('Article text is too short. Please provide at least a full sentence.');
      newsInput.focus();
      showToast('Text too short for sequential neural analysis.', 'error');
      return;
    }

    hideInlineError();
    isAnalyzing = true;
    lastAnalyzedText = rawText;

    // UI Loading state
    analyzeBtn.disabled = true;
    btnSpinner.classList.remove('hidden');
    btnIcon.classList.add('hidden');
    btnText.textContent = 'Analyzing Article...';

    switchState('loading');
    startLoadingSteps();

    const startTime = performance.now();

    try {
      const response = await fetch('/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ news: rawText })
      });

      const latency = Math.round(performance.now() - startTime);
      const data = await response.json();

      stopLoadingSteps();

      if (!response.ok) {
        throw new Error(data.error || `Server returned error (${response.status})`);
      }

      if (!data.prediction) {
        throw new Error('Received invalid response structure from prediction API.');
      }

      // Small delay for smooth perception of neural computation
      setTimeout(() => {
        renderResult(data.prediction, data.confidence, latency);
        showToast(`Verification complete: ${data.prediction}`, data.prediction === 'Real News' ? 'success' : 'error');
      }, 400);

    } catch (err) {
      stopLoadingSteps();
      console.error('Prediction API Error:', err);
      apiErrorMessage.textContent = err.message || 'Unable to establish connection to the Flask LSTM API.';
      switchState('error');
      showToast('Analysis failed: ' + (err.message || 'API error'), 'error', 4500);
    } finally {
      setTimeout(() => {
        isAnalyzing = false;
        analyzeBtn.disabled = false;
        btnSpinner.classList.add('hidden');
        btnIcon.classList.remove('hidden');
        btnText.textContent = 'Analyze News';
      }, 450);
    }
  }

  // --- Event Listeners ---

  // Textarea input monitoring
  newsInput.addEventListener('input', updateTextStats);

  // Keyboard shortcut: Ctrl+Enter or Cmd+Enter to submit
  newsInput.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      performAnalysis();
    }
  });

  // Analyze button click
  analyzeBtn.addEventListener('click', performAnalysis);

  // Retry button click
  retryBtn.addEventListener('click', performAnalysis);

  // Clear button
  clearBtn.addEventListener('click', () => {
    newsInput.value = '';
    updateTextStats();
    hideInlineError();
    newsInput.focus();
    showToast('Input console cleared', 'info', 2000);
  });

  // Paste button
  pasteBtn.addEventListener('click', async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          newsInput.value = text;
          updateTextStats();
          hideInlineError();
          showToast('Text pasted from clipboard', 'success', 2000);
        } else {
          showToast('Clipboard is empty', 'info', 2500);
        }
      } else {
        newsInput.focus();
        showToast('Please press Ctrl+V to paste', 'info', 2500);
      }
    } catch (err) {
      newsInput.focus();
      showToast('Clipboard access denied. Please press Ctrl+V.', 'info', 2500);
    }
  });

  // Sample Real News button
  sampleRealBtn.addEventListener('click', () => {
    newsInput.value = SAMPLE_REAL;
    updateTextStats();
    hideInlineError();
    showToast('Loaded verified real news sample', 'success', 2500);
  });

  // Sample Fake News button
  sampleFakeBtn.addEventListener('click', () => {
    newsInput.value = SAMPLE_FAKE;
    updateTextStats();
    hideInlineError();
    showToast('Loaded sample fake news article', 'info', 2500);
  });

  // Reset / New Analysis
  resetBtn.addEventListener('click', () => {
    switchState('standby');
    newsInput.focus();
  });

  // Copy Verification Report
  copyReportBtn.addEventListener('click', () => {
    const verdict = telemetryLabel.textContent;
    const conf = confidenceValue.textContent;
    const time = inferenceTime.textContent;
    const snippet = newsInput.value.trim().substring(0, 180) + '...';

    const report = [
      '========================================',
      'TruthLens AI — News Credibility Verification Report',
      '========================================',
      `Verdict:           ${verdict.toUpperCase()}`,
      `Model Confidence:  ${conf}%`,
      `Neural Engine:     Bi-LSTM (300 max sequence length)`,
      `Inference Latency: ${time}`,
      `Date / Time:       ${new Date().toLocaleString()}`,
      '----------------------------------------',
      `Article Excerpt:\n"${snippet}"`,
      '========================================'
    ].join('\n');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(report).then(() => {
        copyReportText.textContent = 'Copied!';
        showToast('Verification report copied to clipboard', 'success', 2500);
        setTimeout(() => {
          copyReportText.textContent = 'Copy Report';
        }, 2000);
      });
    } else {
      showToast('Clipboard copy unavailable on this browser', 'error');
    }
  });

  // Clear History
  clearHistoryBtn.addEventListener('click', () => {
    sessionHistory = [];
    renderHistory();
    showToast('Session history cleared', 'info', 2000);
  });

  // Modal logic
  function openModal() {
    infoModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    infoModal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  openModalBtn.addEventListener('click', openModal);
  closeModalBtn.addEventListener('click', closeModal);
  closeModalFooterBtn.addEventListener('click', closeModal);

  infoModal.addEventListener('click', (e) => {
    if (e.target === infoModal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !infoModal.classList.contains('hidden')) {
      closeModal();
    }
  });

  // Initial stats calculation
  updateTextStats();
});

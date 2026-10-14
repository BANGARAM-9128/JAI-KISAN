import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '../contexts/LanguageContext';
import { advisoryApi } from '../services/advisoryApi';
import { feedbackApi } from '../services/feedbackApi';
import { 
  MessageSquare, 
  Star, 
  CheckCircle2, 
  Send, 
  Sprout, 
  ThumbsUp, 
  ThumbsDown, 
  Award 
} from 'lucide-react';

export const FeedbackPage: React.FC = () => {
  const { t, language } = useTranslation();
  const queryClient = useQueryClient();

  const [selectedAdvisoryId, setSelectedAdvisoryId] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [isHelpful, setIsHelpful] = useState<boolean>(true);
  const [wasActionTaken, setWasActionTaken] = useState<boolean>(true);
  const [outcome, setOutcome] = useState<string>('prevented_loss');
  const [comments, setComments] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { data: advisories = [] } = useQuery({
    queryKey: ['advisories'],
    queryFn: () => advisoryApi.getAdvisories(),
  });

  const feedbackMutation = useMutation({
    mutationFn: (payload: any) => feedbackApi.submitFeedback(payload),
    onSuccess: () => {
      setIsSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ['advisories'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    feedbackMutation.mutate({
      advisory_id: selectedAdvisoryId || advisories[0]?.id,
      rating,
      is_helpful: isHelpful,
      was_action_taken: wasActionTaken,
      outcome,
      comments,
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 flex items-center gap-2">
          <MessageSquare className="w-7 h-7 text-green-700" />
          <span>{t('feedbackTitle')}</span>
        </h1>
        <p className="text-sm text-stone-500">
          {t('feedbackSubtitle')}
        </p>
      </div>

      {isSubmitted ? (
        <div className="bg-white rounded-3xl border border-green-200 shadow-sm p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-700">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-stone-900">
            {language === 'te' ? 'ధన్యవాదాలు!' : 'Thank You!'}
          </h2>
          <p className="text-stone-600 max-w-md mx-auto text-sm sm:text-base leading-relaxed">
            {t('feedbackThankYou')}
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                setIsSubmitted(false);
                setComments('');
              }}
              className="px-6 py-2.5 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl text-sm transition-colors shadow-sm"
            >
              {language === 'te' ? 'మరొక సలహాకు అభిప్రాయం చెప్పండి' : 'Submit Another Feedback'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-card p-6 sm:p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Select Advisory */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                {language === 'te' ? 'సలహాను ఎంచుకోండి' : 'Select Advisory to Review'}
              </label>
              <select
                value={selectedAdvisoryId}
                onChange={(e) => setSelectedAdvisoryId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-green-600 text-stone-800 text-sm"
              >
                <option value="">
                  {language === 'te' ? '-- సాధారణ వ్యవస్థ అభిప్రాయం --' : '-- General System Feedback --'}
                </option>
                {advisories.map((a) => (
                  <option key={a.id} value={a.id}>
                    {language === 'te' ? a.title_te : a.title} ({a.crop_name || 'General'})
                  </option>
                ))}
              </select>
            </div>

            {/* Rating Stars */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                {t('ratingLabel')}
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-500'
                          : 'text-stone-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-sm font-bold text-stone-700 ml-2">
                  {rating} / 5
                </span>
              </div>
            </div>

            {/* Helpful question */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                {t('wasAdvisoryHelpful')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsHelpful(true)}
                  className={`p-3 rounded-xl border text-center transition-all flex items-center justify-center gap-2 ${
                    isHelpful
                      ? 'bg-green-50 border-green-600 text-green-950 font-bold ring-2 ring-green-600/20'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4 text-green-600" />
                  <span>{t('yesHelpful')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsHelpful(false)}
                  className={`p-3 rounded-xl border text-center transition-all flex items-center justify-center gap-2 ${
                    !isHelpful
                      ? 'bg-red-50 border-red-500 text-red-950 font-bold ring-2 ring-red-500/20'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <ThumbsDown className="w-4 h-4 text-stone-500" />
                  <span>{t('noNotHelpful')}</span>
                </button>
              </div>
            </div>

            {/* Action taken question */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                {t('actionTakenQuestion')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setWasActionTaken(true)}
                  className={`py-2 px-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                    wasActionTaken
                      ? 'bg-green-50 border-green-600 text-green-900 ring-2 ring-green-600/20'
                      : 'bg-stone-50 border-stone-200 text-stone-600'
                  }`}
                >
                  {language === 'te' ? 'అవును, అమలు చేశాను' : 'Yes, Implemented'}
                </button>

                <button
                  type="button"
                  onClick={() => setWasActionTaken(false)}
                  className={`py-2 px-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                    !wasActionTaken
                      ? 'bg-stone-200 border-stone-400 text-stone-900 font-bold'
                      : 'bg-stone-50 border-stone-200 text-stone-600'
                  }`}
                >
                  {language === 'te' ? 'లేదు, చేయలేదు' : 'No, Did Not Implement'}
                </button>
              </div>
            </div>

            {/* Field outcome description */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                {language === 'te' ? 'పొలంలో ఫలితం' : 'Field Result / Outcome'}
              </label>
              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-green-600 text-stone-800"
              >
                <option value="prevented_loss">
                  {language === 'te' ? 'పంట నష్టాన్ని నివారించింది (Prevented Crop Loss)' : 'Prevented Crop Loss'}
                </option>
                <option value="saved_cost">
                  {language === 'te' ? 'మందులు, ఎరువుల ఖర్చు ఆదా అయ్యింది (Saved Input Cost)' : 'Saved Input Cost'}
                </option>
                <option value="improved_yield">
                  {language === 'te' ? 'దిగుబడి మెరుగుపడింది (Improved Yield)' : 'Improved Yield Quality'}
                </option>
                <option value="no_difference">
                  {language === 'te' ? 'పెద్దగా తేడా కనిపించలేదు (No Major Difference)' : 'No Significant Difference'}
                </option>
              </select>
            </div>

            {/* Comments Box */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                {language === 'te' ? 'మీ వివరమైన అనుభవం / సూచనలు' : 'Detailed Comments or Observations'}
              </label>
              <textarea
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder={t('commentsPlaceholder')}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-green-600 text-stone-800"
              />
            </div>

            <button
              type="submit"
              disabled={feedbackMutation.isPending}
              className="w-full py-3.5 px-6 rounded-2xl bg-green-700 hover:bg-green-800 text-white font-bold text-base shadow-md shadow-green-700/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
              <span>{t('submitFeedback')}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

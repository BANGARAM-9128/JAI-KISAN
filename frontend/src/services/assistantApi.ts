import { apiClient } from './api';
import { ChatMessage, Language } from '../types';

export const assistantApi = {
  async sendMessage(message: string, language: Language = 'te'): Promise<ChatMessage> {
    try {
      const response = await apiClient.post<any>('/assistant/chat', {
        message,
        language,
      });
      const d = response.data;
      if (d && (d.reply || d.reply_te)) {
        const content = language === 'te' && d.reply_te ? d.reply_te : d.reply;
        const sources = Array.isArray(d.sources_used)
          ? d.sources_used.map((s: string) => ({
              title: s,
              source_org: s.includes('ANGRAU') ? 'ANGRAU' : s.includes('ICAR') ? 'ICAR' : 'Weather Model',
            }))
          : [];

        return {
          id: 'msg_' + Date.now(),
          role: 'assistant',
          content,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sources,
          is_demo: false,
        };
      }
      throw new Error('Invalid assistant response');
    } catch {
      // Demo Mode response with authentic agronomic reasoning
      await new Promise((res) => setTimeout(res, 600));

      const lower = message.toLowerCase();
      let reply = '';
      const replySources = [
        {
          title: 'ANGRAU Crop Advisory & Agromet Guidelines',
          source_org: 'ANGRAU',
          url: 'https://angrau.ac.in',
        },
        {
          title: 'ICAR - Central Research Institute for Dryland Agriculture (CRIDA)',
          source_org: 'ICAR',
          url: 'http://crida.in',
        },
      ];

      if (lower.includes('spray') || lower.includes('మందు') || lower.includes('పిచికారీ') || lower.includes('pesticide')) {
        if (language === 'te') {
          reply = 'వాతావరణ సూచనల ప్రకారం రాబోయే 48 గంటల్లో వర్షం లేదా అధిక గాలి వేగం ఉండే అవకాశం ఉన్నందున, రసాయన పురుగుమందుల పిచికారీని వాయిదా వేయండి. వర్షం తగ్గాక, గాలి వేగం 15 కి.మీ/గం కంటే తక్కువగా ఉన్నప్పుడు ఉదయం వేళల్లో పిచికారీ చేయండి.';
        } else {
          reply = 'Based on current weather forecasts with potential rainfall and elevated wind speeds, foliar pesticide spraying is NOT recommended today. Wait until winds are under 15 km/h and foliage is completely dry to prevent spray drift and chemical wash-off.';
        }
      } else if (lower.includes('water') || lower.includes('నీరు') || lower.includes('తడి') || lower.includes('irrigat') || lower.includes('వరి') || lower.includes('paddy')) {
        if (language === 'te') {
          reply = 'వరి పంట పూత/గింజ నిండే దశలో ఉన్నప్పుడు అధిక నీరు నిలిస్తే వేరు వ్యవస్థ దెబ్బతింటుంది. పొలంలో 2-3 సెం.మీ కంటే ఎక్కువ నీరు ఉండకుండా మురుగు కాలువల ద్వారా అదనపు నీటిని బయటకు మళ్లించండి.';
        } else {
          reply = 'For paddy at flowering stage, excess standing water beyond 2-3 cm impairs panicle emergence and root aeration. Clear drainage channels to prevent water stagnation in low-lying bunds.';
        }
      } else if (lower.includes('cotton') || lower.includes('పత్తి') || lower.includes('పురుగు') || lower.includes('bollworm')) {
        if (language === 'te') {
          reply = 'ప్రస్తుత తేమతో కూడిన వాతావరణంలో పత్తిలో రసం పీల్చే పురుగులు మరియు గులాబీ రంగు పురుగు ఆశించే అవకాశం ఉంది. ఎకరానికి 4-6 లింగాకర్షక బుట్టలు (Pheromone traps) అమర్చి పురుగుల ఉధృతిని గమనించండి. వర్షం తగ్గాక వేప నూనె (5 మి.లీ / లీటరు నీటికి) పిచికారీ చేయడం ఉత్తమం.';
        } else {
          reply = 'Humid conditions favor sucking pests and pink bollworm in cotton. Install 4-8 pheromone traps per acre to monitor moth activity. Apply 5% Neem Seed Kernel Extract (NSKE) or 5ml neem oil per liter of water as a preventive measure.';
        }
      } else {
        if (language === 'te') {
          reply = `మీ ప్రశ్నకు ధన్యవాదాలు: "${message}". ప్రస్తుత వాతావరణ పరిస్థితులకు అనుగుణంగా వ్యవసాయ సలహాలను పాటించండి. పంట పెరుగుదల దశకు తగిన శాస్త్రీయ సమాచారం కోసం 'సలహాలు' విభాగాన్ని పరిశీలించండి.`;
        } else {
          reply = `Thank you for your inquiry: "${message}". Please review the tailored advisories tab for field-specific recommendations calibrated with local weather predictions.`;
        }
      }

      return {
        id: 'msg_' + Date.now(),
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: replySources,
        is_demo: true,
      };
    }
  },
};

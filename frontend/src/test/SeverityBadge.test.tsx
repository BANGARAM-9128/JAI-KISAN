import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { SeverityBadge } from '../components/SeverityBadge';
import { LanguageProvider } from '../contexts/LanguageContext';

const renderWithLanguage = (ui: React.ReactElement) => {
  return render(
    React.createElement(LanguageProvider, null, ui)
  );
};

describe('SeverityBadge Component', () => {
  it('renders critical severity label properly', () => {
    renderWithLanguage(React.createElement(SeverityBadge, { severity: 'critical' }));
    expect(screen.getByText(/అత్యవసరం|Critical/i)).toBeInTheDocument();
  });

  it('renders high severity label properly', () => {
    renderWithLanguage(React.createElement(SeverityBadge, { severity: 'high' }));
    expect(screen.getByText(/తీవ్ర హెచ్చరిక|High Alert/i)).toBeInTheDocument();
  });

  it('renders medium severity label properly', () => {
    renderWithLanguage(React.createElement(SeverityBadge, { severity: 'medium' }));
    expect(screen.getByText(/మధ్యస్థ శ్రద్ధ|Medium Alert/i)).toBeInTheDocument();
  });

  it('renders low severity label properly', () => {
    renderWithLanguage(React.createElement(SeverityBadge, { severity: 'low' }));
    expect(screen.getByText(/సాధారణం|Low/i)).toBeInTheDocument();
  });
});

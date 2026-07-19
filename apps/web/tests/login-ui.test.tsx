import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LoginExperience } from '@/app/login/login-experience';

describe('login experience', () => {
  it('renders LINE as the primary native button with product context', () => {
    const markup = renderToStaticMarkup(
      <LoginExperience adminEnabled={false} />
    );
    expect(markup).toContain('ดำเนินการต่อด้วย LINE');
    expect(markup).toContain('<button');
    expect(markup).toContain('Personal ledger / THB');
    expect(markup).toContain('wallet.monthly');
    expect(markup).toContain('Preview');
  });

  it('only renders maintenance admin entry when enabled', () => {
    const disabled = renderToStaticMarkup(
      <LoginExperience adminEnabled={false} />
    );
    const enabled = renderToStaticMarkup(
      <LoginExperience adminEnabled />
    );
    expect(disabled).not.toContain('Maintenance Admin');
    expect(enabled).toContain('Maintenance Admin');
    expect(enabled).toContain('/admin/login');
  });

  it('contains responsive and accessible login affordances', () => {
    const markup = renderToStaticMarkup(
      <LoginExperience adminEnabled={false} />
    );
    expect(markup).toContain('<main');
    expect(markup).toContain('<h1');
    expect(markup).toContain('aria-describedby="line-login-note"');
    expect(markup).toContain('min-h-screen');
    expect(markup).toContain('lg:grid-cols');
  });
});

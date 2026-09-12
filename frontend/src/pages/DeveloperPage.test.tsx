import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DeveloperPage } from './DeveloperPage';
import { Sidebar } from '../components/layout/Sidebar';
import {
  developer,
  engineeringHighlights,
  projectLinks,
  techStack,
} from '../config/developer';

/** Render the page the same way App.tsx mounts it (inside a router). */
function renderPage() {
  return render(
    <MemoryRouter>
      <DeveloperPage />
    </MemoryRouter>,
  );
}

/** Every <a> pointing at an absolute http(s) URL on the page. */
function getExternalLinks(container: HTMLElement): HTMLAnchorElement[] {
  return Array.from(container.querySelectorAll<HTMLAnchorElement>('a[href^="http"]'));
}

describe('DeveloperPage', () => {
  it('renders the developer hero with name and role', () => {
    renderPage();

    expect(screen.getByRole('heading', { level: 2, name: developer.name })).toBeTruthy();
    expect(screen.getByText(developer.role)).toBeTruthy();
  });

  it('renders the main page sections', () => {
    renderPage();

    expect(screen.getByText('About the Developer')).toBeTruthy();
    expect(screen.getByText('Why TaskFlow Exists')).toBeTruthy();
    expect(screen.getByText('Engineering Highlights')).toBeTruthy();
    expect(screen.getByText('Project Links')).toBeTruthy();
  });

  it('renders every tech stack category with its items', () => {
    renderPage();

    for (const category of techStack) {
      expect(screen.getByText(category.name)).toBeTruthy();
      for (const item of category.items) {
        expect(screen.getByText(item.name)).toBeTruthy();
      }
    }
  });

  it('renders engineering highlights', () => {
    renderPage();

    for (const highlight of engineeringHighlights) {
      expect(screen.getByText(highlight.title)).toBeTruthy();
    }
  });

  it('links to the developer GitHub profile', () => {
    renderPage();

    // Scope to the hero's social links so the "GitHub Repository"
    // project-link card lower on the page cannot match first.
    const socials = screen.getByRole('list', { name: 'Developer profiles' });
    const github = within(socials).getByRole('link', { name: /github/i });
    expect(github.getAttribute('href')).toBe(developer.socialLinks[0].url);
  });

  it('renders all project links with safe external attributes', () => {
    renderPage();

    for (const link of projectLinks) {
      const anchor = screen.getByRole('link', { name: new RegExp(link.label) });
      expect(anchor.getAttribute('href')).toBe(link.url);
      expect(anchor.getAttribute('target')).toBe('_blank');
      expect(anchor.getAttribute('rel')).toContain('noopener');
    }
  });

  it('opens every external link safely with rel=noopener noreferrer', () => {
    const { container } = renderPage();

    const external = getExternalLinks(container);
    expect(external.length).toBeGreaterThan(0);
    for (const anchor of external) {
      expect(anchor.getAttribute('target')).toBe('_blank');
      const rel = anchor.getAttribute('rel')?.split(/\s+/) ?? [];
      expect(rel).toEqual(expect.arrayContaining(['noopener', 'noreferrer']));
    }
  });

  it('sets the document title to Developer', () => {
    renderPage();

    expect(document.title).toBe('Developer — TaskFlow');
  });
});

describe('Sidebar Developer navigation', () => {
  it('has a Developer link pointing at /developer', () => {
    render(
      <MemoryRouter>
        <Sidebar open={false} onClose={() => {}} />
      </MemoryRouter>,
    );

    const link = screen.getByRole('link', { name: /developer/i });
    expect(link.getAttribute('href')).toBe('/developer');
  });
});

/**
 * Tests for CertificateVerifyPage
 * Verifies rendering of valid, invalid, loading, and error states.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CertificateVerifyPage from '../pages/certificates/CertificateVerifyPage';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock import.meta.env
vi.stubGlobal('import', {
  meta: { env: { VITE_PYTHON_API_BASE: 'http://localhost:8000' } },
});

const CERT_ID = 'NS-CERT-ABCD1234EFGH5678';

const VALID_RESPONSE = {
  valid: true,
  message: 'Certificate verified successfully.',
  certificate: {
    certificate_id: CERT_ID,
    student_id: 'STU001',
    student_name: 'Anshika Rai',
    event_id: 'kss-153',
    event_name: 'Knowledge Sharing Session #153',
    issue_date: 'May 21, 2025',
    verification_url: `http://localhost:5175/verify/${CERT_ID}`,
    status: 'valid',
  },
};

const INVALID_RESPONSE = {
  valid: false,
  message: 'Certificate not found. It may have been revoked or does not exist.',
  certificate: null,
};

beforeEach(() => {
  mockFetch.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('CertificateVerifyPage', () => {
  it('shows loading state initially', () => {
    mockFetch.mockReturnValue(new Promise(() => {})); // never resolves
    render(<CertificateVerifyPage certificateId={CERT_ID} onGoHome={() => {}} />);
    expect(screen.getByRole('status')).toBeInTheDocument(); // spinner
    expect(screen.getByText(/Verifying certificate/i)).toBeInTheDocument();
  });

  it('renders verified badge and student info for a valid certificate', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => VALID_RESPONSE,
    });

    render(<CertificateVerifyPage certificateId={CERT_ID} onGoHome={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(/Certificate Verified/i)).toBeInTheDocument();
    });

    expect(screen.getByText('Anshika Rai')).toBeInTheDocument();
    expect(screen.getByText('Knowledge Sharing Session #153')).toBeInTheDocument();
    expect(screen.getByText('May 21, 2025')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Download Certificate/i })).toBeInTheDocument();
  });

  it('renders invalid badge for an unknown certificate ID', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => INVALID_RESPONSE,
    });

    render(<CertificateVerifyPage certificateId="NS-CERT-INVALID0000" onGoHome={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(/Not Verified/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Certificate not found/i)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Download/i })).not.toBeInTheDocument();
  });

  it('renders invalid badge when no certificateId is provided', async () => {
    render(<CertificateVerifyPage certificateId={null} onGoHome={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(/Not Verified/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/No certificate ID provided/i)).toBeInTheDocument();
  });

  it('renders error state when fetch fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<CertificateVerifyPage certificateId={CERT_ID} onGoHome={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(/Not Verified/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Unable to reach the verification server/i)).toBeInTheDocument();
  });

  it('shows NexaSphere branding', () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    render(<CertificateVerifyPage certificateId={CERT_ID} onGoHome={() => {}} />);
    expect(screen.getByText('NexaSphere')).toBeInTheDocument();
    expect(screen.getByText(/Certificate Verification Portal/i)).toBeInTheDocument();
  });

  it('has a back button that calls onGoHome', () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    const onGoHome = vi.fn();
    render(<CertificateVerifyPage certificateId={CERT_ID} onGoHome={onGoHome} />);
    const backBtn = screen.getByRole('button', { name: /Go back to homepage/i });
    backBtn.click();
    expect(onGoHome).toHaveBeenCalled();
  });
});

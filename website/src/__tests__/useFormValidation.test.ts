import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useFormValidation from '../hooks/useFormValidation';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Runs a single-field validation and returns the resulting errors object. */
function validateSingleField(
  fieldName: string,
  value: unknown,
  rules: Record<string, unknown>
): any {
  const { result } = renderHook(() =>
    useFormValidation({ [fieldName]: value }, { [fieldName]: rules })
  );

  let isValid: boolean;
  act(() => {
    isValid = result.current.validateForm([fieldName]);
  });

  return result.current.errors as any;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useFormValidation', () => {
  // -------------------------------------------------------------------------
  // required
  // -------------------------------------------------------------------------
  describe('required rule', () => {
    it('reports error for empty string', () => {
      const errors = validateSingleField('name', '', { required: true });
      expect(errors.name).toBe('This field is required');
    });

    it('reports error for whitespace-only string', () => {
      const errors = validateSingleField('name', '   ', { required: true });
      expect(errors.name).toBe('This field is required');
    });

    it('passes for non-empty string', () => {
      const errors = validateSingleField('name', 'Nexasphere', {
        required: true,
      });
      expect(errors.name).toBeUndefined();
    });

    it('accepts a custom requiredMessage', () => {
      const errors = validateSingleField('name', '', {
        required: true,
        requiredMessage: 'Name is mandatory',
      });
      expect(errors.name).toBe('Name is mandatory');
    });

    it('reports error for empty array', () => {
      const errors = validateSingleField('tags', [], { required: true });
      expect(errors.tags).toBe('This field is required');
    });

    it('passes for non-empty array', () => {
      const errors = validateSingleField('tags', ['open-source'], {
        required: true,
      });
      expect(errors.tags).toBeUndefined();
    });
  });

  // -------------------------------------------------------------------------
  // email
  // -------------------------------------------------------------------------
  describe('email rule', () => {
    it('reports error for invalid email', () => {
      const errors = validateSingleField('email', 'not-an-email', {
        email: true,
      });
      expect(errors.email).toBe('Please enter a valid email address');
    });

    it('passes for valid email', () => {
      const errors = validateSingleField('email', 'user@nexasphere.dev', {
        email: true,
      });
      expect(errors.email).toBeUndefined();
    });

    it('does not error for empty value when not required', () => {
      const errors = validateSingleField('email', '', { email: true });
      expect(errors.email).toBeUndefined();
    });
  });

  // -------------------------------------------------------------------------
  // phone
  // -------------------------------------------------------------------------
  describe('phone rule', () => {
    it('reports error for phone shorter than 10 digits', () => {
      const errors = validateSingleField('phone', '12345', { phone: true });
      expect(errors.phone).toBe('Phone number must be exactly 10 digits');
    });

    it('reports error for phone with non-digit characters', () => {
      const errors = validateSingleField('phone', '9876-54321', {
        phone: true,
      });
      expect(errors.phone).toBe('Phone number must be exactly 10 digits');
    });

    it('passes for exactly 10 digits', () => {
      const errors = validateSingleField('phone', '9876543210', {
        phone: true,
      });
      expect(errors.phone).toBeUndefined();
    });

    it('does not error for empty value when not required', () => {
      const errors = validateSingleField('phone', '', { phone: true });
      expect(errors.phone).toBeUndefined();
    });
  });

  // -------------------------------------------------------------------------
  // minLength
  // -------------------------------------------------------------------------
  describe('minLength rule', () => {
    it('reports error when value is shorter than minLength', () => {
      const errors = validateSingleField('bio', 'Hi', { minLength: 10 });
      expect(errors.bio).toBe('Minimum length is 10 characters');
    });

    it('passes when value meets minLength', () => {
      const errors = validateSingleField('bio', 'Hello World', {
        minLength: 10,
      });
      expect(errors.bio).toBeUndefined();
    });

    it('does not error for empty value when not required', () => {
      // empty string skips the minLength guard (`if (strVal && ...)`)
      const errors = validateSingleField('bio', '', { minLength: 5 });
      expect(errors.bio).toBeUndefined();
    });
  });

  // -------------------------------------------------------------------------
  // maxLength  (new rule — previously missing)
  // -------------------------------------------------------------------------
  describe('maxLength rule', () => {
    it('reports error when value exceeds maxLength', () => {
      const errors = validateSingleField('username', 'a'.repeat(21), {
        maxLength: 20,
      });
      expect(errors.username).toBe('Maximum length is 20 characters');
    });

    it('passes when value is exactly maxLength', () => {
      const errors = validateSingleField('username', 'a'.repeat(20), {
        maxLength: 20,
      });
      expect(errors.username).toBeUndefined();
    });

    it('passes when value is shorter than maxLength', () => {
      const errors = validateSingleField('username', 'nexasphere', {
        maxLength: 20,
      });
      expect(errors.username).toBeUndefined();
    });

    it('does not error for empty value when not required', () => {
      const errors = validateSingleField('username', '', { maxLength: 20 });
      expect(errors.username).toBeUndefined();
    });

    it('accepts a custom maxLengthMessage', () => {
      const errors = validateSingleField('username', 'a'.repeat(21), {
        maxLength: 20,
        maxLengthMessage: 'Username cannot exceed 20 characters',
      });
      expect(errors.username).toBe('Username cannot exceed 20 characters');
    });

    it('works together with minLength on the same field', () => {
      const rules = { minLength: 3, maxLength: 10 };

      const tooShort = validateSingleField('username', 'ab', rules);
      expect(tooShort.username).toBe('Minimum length is 3 characters');

      const tooLong = validateSingleField('username', 'a'.repeat(11), rules);
      expect(tooLong.username).toBe('Maximum length is 10 characters');

      const justRight = validateSingleField('username', 'nexasphere', rules);
      expect(justRight.username).toBeUndefined();
    });
  });

  // -------------------------------------------------------------------------
  // url  (new rule — previously missing)
  // -------------------------------------------------------------------------
  describe('url rule', () => {
    it('reports error for a plain string without a protocol', () => {
      const errors = validateSingleField('website', 'example.com', {
        url: true,
      });
      expect(errors.website).toBe('Please enter a valid URL (e.g. https://example.com)');
    });

    it('reports error for a completely malformed URL', () => {
      const errors = validateSingleField('website', 'not a url!!', {
        url: true,
      });
      expect(errors.website).toBe('Please enter a valid URL (e.g. https://example.com)');
    });

    it('passes for a valid https URL', () => {
      const errors = validateSingleField('website', 'https://nexasphere.dev', {
        url: true,
      });
      expect(errors.website).toBeUndefined();
    });

    it('passes for a valid http URL', () => {
      const errors = validateSingleField('website', 'http://nexasphere.dev/path?q=1', {
        url: true,
      });
      expect(errors.website).toBeUndefined();
    });

    it('does not error for empty value when not required', () => {
      const errors = validateSingleField('website', '', { url: true });
      expect(errors.website).toBeUndefined();
    });

    it('accepts a custom urlMessage', () => {
      const errors = validateSingleField('website', 'bad', {
        url: true,
        urlMessage: 'Enter a full URL including https://',
      });
      expect(errors.website).toBe('Enter a full URL including https://');
    });
  });

  // -------------------------------------------------------------------------
  // custom
  // -------------------------------------------------------------------------
  describe('custom rule', () => {
    it('reports the error returned by the custom function', () => {
      const errors = validateSingleField('password', 'abc', {
        custom: (v: string) => (v.length < 8 ? 'Too weak' : ''),
      });
      expect(errors.password).toBe('Too weak');
    });

    it('passes when the custom function returns empty string', () => {
      const errors = validateSingleField('password', 'str0ngPass!', {
        custom: (v: string) => (v.length < 8 ? 'Too weak' : ''),
      });
      expect(errors.password).toBeUndefined();
    });
  });

  // -------------------------------------------------------------------------
  // handleChange / live re-validation
  // -------------------------------------------------------------------------
  describe('handleChange live re-validation', () => {
    it('clears the error once the user fixes the value', () => {
      const { result } = renderHook(() =>
        useFormValidation({ username: '' }, { username: { required: true, maxLength: 10 } })
      );

      // Touch the field so re-validation is active
      act(() => {
        result.current.validateForm(['username']);
      });
      expect((result.current.errors as any).username).toBe('This field is required');

      // User types a valid value
      act(() => {
        result.current.handleChange('username', 'Nexasphere');
      });
      expect((result.current.errors as any).username).toBeUndefined();
    });

    it('shows maxLength error as soon as the user exceeds the limit', () => {
      const { result } = renderHook(() =>
        useFormValidation({ username: 'valid' }, { username: { maxLength: 10 } })
      );

      // Touch first
      act(() => {
        result.current.handleBlur('username');
      });

      act(() => {
        result.current.handleChange('username', 'a'.repeat(11));
      });
      expect((result.current.errors as any).username).toBe('Maximum length is 10 characters');
    });
  });

  // -------------------------------------------------------------------------
  // resetForm
  // -------------------------------------------------------------------------
  describe('resetForm', () => {
    it('clears values, errors, and touched state', () => {
      const { result } = renderHook(() =>
        useFormValidation({ name: '' }, { name: { required: true } })
      );

      act(() => {
        result.current.validateForm();
      });
      expect((result.current.errors as any).name).toBeDefined();

      act(() => {
        result.current.resetForm();
      });
      expect(result.current.errors).toEqual({});
      expect(result.current.touched).toEqual({});
      expect(result.current.values).toEqual({ name: '' });
    });
  });
});

import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for form handling with validation
 * @param {Object} options
 * @param {Object} [options.initialValues={}] - Initial form values
 * @param {Function} [options.validate] - Validation function
 * @param {Function} [options.onSubmit] - Submit handler
 * @param {boolean} [options.validateOnChange=false] - Whether to validate on each change
 * @param {boolean} [options.validateOnBlur=true] - Whether to validate on blur
 * @returns {Object} Form state and handlers
 */
export const useForm = ({
  initialValues = {},
  validate,
  onSubmit,
  validateOnChange = false,
  validateOnBlur = true,
}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setSubmitError(null);
  }, [initialValues]);

  /**
   * Set specific field value
   * @param {string} field - Field name
   * @param {any} value - Field value
   */
  const setFieldValue = useCallback((field, value) => {
    setValues(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  /**
   * Set multiple field values
   * @param {Object} newValues - Object with field-value pairs
   */
  const setMultipleFields = useCallback((newValues) => {
    setValues(prev => ({
      ...prev,
      ...newValues,
    }));
  }, []);

  /**
   * Handle field change
   * @param {Event|string} eventOrField - Event object or field name
   * @param {any} [value] - Field value (if field name provided)
   */
  const handleChange = useCallback((eventOrField, value) => {
    const isEvent = eventOrField?.target && typeof eventOrField.target === 'object';
    const fieldName = isEvent ? eventOrField.target.name : eventOrField;
    const fieldValue = isEvent ? 
      eventOrField.target.type === 'checkbox' ? 
        eventOrField.target.checked : 
        eventOrField.target.value 
      : value;

    setValues(prev => ({
      ...prev,
      [fieldName]: fieldValue,
    }));

    if (validateOnChange && validate) {
      const validationErrors = validate({
        ...values,
        [fieldName]: fieldValue,
      });
      setErrors(validationErrors || {});
    }
  }, [validate, validateOnChange, values]);

  /**
   * Handle field blur
   * @param {Event|string} eventOrField - Event object or field name
   */
  const handleBlur = useCallback((eventOrField) => {
    const fieldName = typeof eventOrField === 'string' ? 
      eventOrField : 
      eventOrField.target.name;

    setTouched(prev => ({
      ...prev,
      [fieldName]: true,
    }));

    if (validateOnBlur && validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors || {});
    }
  }, [validate, validateOnBlur, values]);

  /**
   * Handle form submission
   * @param {Event} event
   */
  const handleSubmit = useCallback(async (event) => {
    if (event) {
      event.preventDefault();
    }

    if (!onSubmit) return;

    // Validate all fields
    let validationErrors = {};
    if (validate) {
      validationErrors = validate(values) || {};
      setErrors(validationErrors);
      
      // Mark all fields as touched
      const touchedFields = Object.keys(values).reduce(
        (acc, field) => ({ ...acc, [field]: true }),
        {}
      );
      setTouched(touchedFields);

      if (Object.keys(validationErrors).length > 0) {
        return;
      }
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit(values);
    } catch (error) {
      setSubmitError(error.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, validate, values]);

  /**
   * Check if field has error
   * @param {string} field - Field name
   * @returns {boolean}
   */
  const hasError = useCallback((field) => {
    return touched[field] && Boolean(errors[field]);
  }, [errors, touched]);

  /**
   * Get field error message
   * @param {string} field - Field name
   * @returns {string|null}
   */
  const getFieldError = useCallback((field) => {
    return touched[field] ? errors[field] : null;
  }, [errors, touched]);

  /**
   * Check if form is valid
   * @returns {boolean}
   */
  const isValid = useCallback(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  /**
   * Check if any field is touched
   * @returns {boolean}
   */
  const isDirty = useCallback(() => {
    return Object.keys(touched).length > 0;
  }, [touched]);

  return {
    // State
    values,
    errors,
    touched,
    isSubmitting,
    submitError,

    // Handlers
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setMultipleFields,
    resetForm,

    // Helpers
    hasError,
    getFieldError,
    isValid,
    isDirty,
  };
};
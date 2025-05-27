// Global variables
let formValidated = false;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    initializeContactForm();
    initializeEventListeners();
    initializeLoadingAnimations();
});

// Initialize contact form functionality
function initializeContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    // Real-time validation
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearValidation);
    });

    // Phone number formatting
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', formatPhoneNumber);
    }

    // Message character counter
    const messageTextarea = document.getElementById('message');
    if (messageTextarea) {
        messageTextarea.addEventListener('input', updateCharCount);
        updateCharCount(); // Initial count
    }

    // Form submission
    form.addEventListener('submit', handleFormSubmission);

    // Reset form
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', handleFormReset);
    }
}

// Initialize all event listeners
function initializeEventListeners() {
    // Emergency contact interaction
    const emergencyBtn = document.querySelector('.emergency-contact .btn');
    if (emergencyBtn) {
        emergencyBtn.addEventListener('click', function(e) {
            console.log('Emergency contact clicked');
            // Track emergency contact usage
        });
    }

    // FAQ analytics
    document.querySelectorAll('.accordion-button').forEach(button => {
        button.addEventListener('click', function() {
            const question = this.textContent.trim();
            console.log('FAQ opened:', question);
        });
    });

    // Social media link tracking
    document.querySelectorAll('.social-icon').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const platform = this.querySelector('i')?.className || 'unknown';
            console.log('Social media clicked:', platform);
        });
    });

    // Accordion functionality
    initializeAccordion();
}

// Phone number formatting
function formatPhoneNumber(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length >= 11) {
        value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (value.length >= 7) {
        value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else if (value.length >= 3) {
        value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    }
    
    e.target.value = value;
}

// Message character counter
function updateCharCount() {
    const messageTextarea = document.getElementById('message');
    if (!messageTextarea) return;
    
    const messageParent = messageTextarea.parentElement;
    const count = messageTextarea.value.length;
    
    let helpText = messageParent.querySelector('.form-text');
    if (!helpText) {
        helpText = document.createElement('div');
        helpText.className = 'form-text';
        messageParent.appendChild(helpText);
    }
    
    const minChars = 20;
    const remaining = Math.max(0, minChars - count);
    
    if (count < minChars) {
        helpText.innerHTML = `Mínimo de ${minChars} caracteres. Faltam ${remaining} caracteres.`;
        helpText.className = 'form-text text-warning';
    } else {
        helpText.innerHTML = `${count} caracteres. Seja específico para recebermos uma resposta mais precisa.`;
        helpText.className = 'form-text text-success';
    }
}

// Form submission handler
function handleFormSubmission(e) {
    e.preventDefault();
    e.stopPropagation();

    const form = e.target;
    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');

    // Hide previous messages
    successMessage?.classList.add('d-none');
    errorMessage?.classList.add('d-none');

    // Validate all fields
    const inputs = form.querySelectorAll('input, select, textarea');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateField({ target: input })) {
            isValid = false;
        }
    });

    if (isValid && form.checkValidity()) {
        // Show loading state
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Enviando...';
            submitBtn.disabled = true;
        }

        // Simulate API call
        setTimeout(() => {
            const success = Math.random() > 0.1; // 90% success rate
            
            if (success) {
                // Show success message
                successMessage?.classList.remove('d-none');
                
                // Reset form
                form.reset();
                updateCharCount();
                
                // Clear all validation states
                inputs.forEach(input => {
                    input.classList.remove('is-valid', 'is-invalid');
                });
                
                // Scroll to success message
                successMessage?.scrollIntoView({ behavior: 'smooth' });
                
                // Send analytics event
                console.log('Contact form submitted successfully');
                
            } else {
                // Show error message
                errorMessage?.classList.remove('d-none');
                errorMessage?.scrollIntoView({ behavior: 'smooth' });
            }

            // Reset button
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Enviar Mensagem';
                submitBtn.disabled = false;
            }
        }, 2000);
    } else {
        form.classList.add('was-validated');
        
        // Focus on first invalid field
        const firstInvalid = form.querySelector('.is-invalid, :invalid');
        if (firstInvalid) {
            firstInvalid.focus();
            firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

// Form reset handler
function handleFormReset() {
    setTimeout(() => {
        const form = document.getElementById('contactForm');
        const inputs = form?.querySelectorAll('input, select, textarea');
        
        form?.classList.remove('was-validated');
        
        inputs?.forEach(input => {
            input.classList.remove('is-valid', 'is-invalid');
        });
        
        // Hide messages
        document.getElementById('successMessage')?.classList.add('d-none');
        document.getElementById('errorMessage')?.classList.add('d-none');
        
        // Reset character count
        updateCharCount();
        
        console.log('Form reset');
    }, 10);
}

// Field validation function
function validateField(e) {
    const input = e.target;
    const value = input.value.trim();
    let isValid = true;

    // Remove previous validation
    input.classList.remove('is-valid', 'is-invalid');

    // Skip validation for optional fields that are empty
    if (!input.required && value === '') {
        return true;
    }

    // Required field validation
    if (input.required && value === '') {
        isValid = false;
    }

    // Specific validations
    switch (input.type) {
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (value && !emailRegex.test(value)) {
                isValid = false;
            }
            break;
        
        case 'tel':
            if (value && value.length < 14) { // (11) 99999-9999
                isValid = false;
            }
            break;
    }

    // Custom validations
    if (input.id === 'name' && value && value.length < 2) {
        isValid = false;
    }

    if (input.id === 'message' && value && value.length < 20) {
        isValid = false;
    }

    // Apply validation classes
    if (isValid && value !== '') {
        input.classList.add('is-valid');
    } else if (!isValid) {
        input.classList.add('is-invalid');
    }

    return isValid;
}

// Clear validation on input
function clearValidation(e) {
    const input = e.target;
    if (input.classList.contains('is-invalid')) {
        input.classList.remove('is-invalid');
    }
}

// Initialize accordion functionality
function initializeAccordion() {
    document.querySelectorAll('.accordion-button').forEach(button => {
        button.addEventListener('click', function() {
            const target = this.getAttribute('data-bs-target');
            if (!target) return;
            
            const collapse = document.querySelector(target);
            if (!collapse) return;
            
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            
            // Close all other accordion items
            document.querySelectorAll('.accordion-collapse').forEach(item => {
                if (item !== collapse) {
                    item.classList.remove('show');
                    const button = document.querySelector(`[data-bs-target="#${item.id}"]`);
                    if (button) {
                        button.classList.add('collapsed');
                        button.setAttribute('aria-expanded', 'false');
                    }
                }
            });
            
            // Toggle current item
            if (isExpanded) {
                collapse.classList.remove('show');
                this.classList.add('collapsed');
                this.setAttribute('aria-expanded', 'false');
            } else {
                collapse.classList.add('show');
                this.classList.remove('collapsed');
                this.setAttribute('aria-expanded', 'true');
            }
        });
    });
}

// Loading animations
function initializeLoadingAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('loaded');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.loading').forEach(el => {
        observer.observe(el);
    });

    // Initial load for visible elements
    setTimeout(() => {
        document.querySelectorAll('.loading').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight) {
                el.classList.add('loaded');
            }
        });
    }, 500);
}

// Form auto-save functionality
function initializeAutoSave() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    const inputs = form.querySelectorAll('input, select, textarea');
    const STORAGE_KEY = 'contactForm_autoSave';
    
    // Load saved data
    loadFormData();
    
    // Save data on input
    inputs.forEach(input => {
        input.addEventListener('input', saveFormData);
    });
    
    function saveFormData() {
        const formData = {};
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                formData[input.id] = input.checked;
            } else {
                formData[input.id] = input.value;
            }
        });
        
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
        } catch (e) {
            console.log('Could not save form data to localStorage');
        }
    }
    
    function loadFormData() {
        try {
            const savedData = localStorage.getItem(STORAGE_KEY);
            if (savedData) {
                const formData = JSON.parse(savedData);
                
                Object.keys(formData).forEach(key => {
                    const input = document.getElementById(key);
                    if (input) {
                        if (input.type === 'checkbox') {
                            input.checked = formData[key];
                        } else {
                            input.value = formData[key];
                        }
                    }
                });
                
                // Update character count if message was loaded
                updateCharCount();
            }
        } catch (e) {
            console.log('Could not load form data from localStorage');
        }
    }
    
    // Clear saved data on successful submission
    form.addEventListener('submit', function() {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
            console.log('Could not remove saved form data');
        }
    });
}

// Initialize auto-save after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeAutoSave();
});

// Form validation with real-time feedback
function enhanceFormValidation() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    // Add custom validation messages
    const validationMessages = {
        name: {
            valueMissing: 'Por favor, informe seu nome completo.',
            tooShort: 'O nome deve ter pelo menos 2 caracteres.'
        },
        email: {
            valueMissing: 'Por favor, informe seu e-mail.',
            typeMismatch: 'Por favor, informe um e-mail válido.',
            patternMismatch: 'Formato de e-mail inválido.'
        },
        phone: {
            patternMismatch: 'Formato inválido. Use: (11) 99999-9999'
        },
        subject: {
            valueMissing: 'Por favor, selecione um assunto.'
        },
        message: {
            valueMissing: 'Por favor, escreva sua mensagem.',
            tooShort: 'A mensagem deve ter pelo menos 20 caracteres.'
        },
        privacy: {
            valueMissing: 'Você deve concordar com os termos de privacidade.'
        }
    };
    
    // Custom validation for each field
    Object.keys(validationMessages).forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field) return;
        
        field.addEventListener('invalid', function(e) {
            e.preventDefault();
            
            const messages = validationMessages[fieldId];
            const validity = field.validity;
            
            let customMessage = '';
            
            if (validity.valueMissing) {
                customMessage = messages.valueMissing;
            } else if (validity.typeMismatch) {
                customMessage = messages.typeMismatch;
            } else if (validity.patternMismatch) {
                customMessage = messages.patternMismatch;
            } else if (validity.tooShort) {
                customMessage = messages.tooShort;
            }
            
            field.setCustomValidity(customMessage);
            
            // Update feedback display
            const feedback = field.parentElement.querySelector('.invalid-feedback');
            if (feedback) {
                feedback.textContent = customMessage;
            }
        });
        
        field.addEventListener('input', function() {
            field.setCustomValidity('');
        });
    });
}

// Initialize enhanced validation
document.addEventListener('DOMContentLoaded', function() {
    enhanceFormValidation();
});

// Contact info interactions
function initializeContactInteractions() {
    // Phone number click to call
    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
        link.addEventListener('click', function() {
            console.log('Phone call initiated:', this.href);
        });
    });
    
    // Email click to compose
    document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
        link.addEventListener('click', function() {
            console.log('Email composition initiated:', this.href);
        });
    });
    
    // Copy contact info to clipboard
    document.querySelectorAll('.contact-info-item').forEach(item => {
        item.addEventListener('dblclick', function() {
            const textToCopy = this.textContent.trim();
            
            if (navigator.clipboard) {
                navigator.clipboard.writeText(textToCopy).then(() => {
                    showToast('Informação copiada para a área de transferência!');
                });
            }
        });
    });
}

// Show toast notification
function showToast(message, type = 'success') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.textContent = message;
    
    // Style the toast
    Object.assign(toast.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        background: type === 'success' ? '#d1fae5' : '#fee2e2',
        color: type === 'success' ? '#065f46' : '#991b1b',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        zIndex: '9999',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease'
    });
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Initialize contact interactions
document.addEventListener('DOMContentLoaded', function() {
    initializeContactInteractions();
});

// Form analytics and tracking
function trackFormInteraction(action, field = null) {
    const data = {
        action: action,
        field: field,
        timestamp: new Date().toISOString(),
        page: 'contact'
    };
    
    console.log('Form interaction tracked:', data);
    
    // Here you would send this data to your analytics service
    // Example: gtag('event', action, { field: field });
}

// Add analytics tracking to form events
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    // Track form start
    let formStarted = false;
    form.addEventListener('input', function() {
        if (!formStarted) {
            trackFormInteraction('form_started');
            formStarted = true;
        }
    });
    
    // Track field interactions
    form.querySelectorAll('input, select, textarea').forEach(field => {
        field.addEventListener('focus', function() {
            trackFormInteraction('field_focused', this.id);
        });
        
        field.addEventListener('blur', function() {
            if (this.value.trim()) {
                trackFormInteraction('field_completed', this.id);
            }
        });
    });
    
    // Track form submission attempt
    form.addEventListener('submit', function() {
        trackFormInteraction('form_submitted');
    });
});

// Accessibility improvements
function improveAccessibility() {
    // Add ARIA labels and descriptions
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    // Set form role and label
    form.setAttribute('role', 'form');
    form.setAttribute('aria-label', 'Formulário de contato');
    
    // Improve field accessibility
    form.querySelectorAll('input, select, textarea').forEach(field => {
        const label = form.querySelector(`label[for="${field.id}"]`);
        const feedback = field.parentElement.querySelector('.invalid-feedback');
        
        if (label) {
            field.setAttribute('aria-labelledby', label.id || `${field.id}-label`);
        }
        
        if (feedback) {
            field.setAttribute('aria-describedby', `${field.id}-feedback`);
            feedback.id = `${field.id}-feedback`;
        }
        
        // Add aria-invalid for validation
        field.addEventListener('invalid', function() {
            this.setAttribute('aria-invalid', 'true');
        });
        
        field.addEventListener('input', function() {
            if (this.validity.valid) {
                this.setAttribute('aria-invalid', 'false');
            }
        });
    });
    
    // Improve button accessibility
    document.querySelectorAll('.btn').forEach(button => {
        if (!button.getAttribute('aria-label') && button.title) {
            button.setAttribute('aria-label', button.title);
        }
    });
    
    // Improve accordion accessibility
    document.querySelectorAll('.accordion-button').forEach(button => {
        button.setAttribute('role', 'button');
        button.setAttribute('aria-expanded', 'false');
    });
}

// Initialize accessibility improvements
document.addEventListener('DOMContentLoaded', function() {
    improveAccessibility();
});

// Form field suggestions and auto-complete
function initializeFieldSuggestions() {
    const organizationField = document.getElementById('organization');
    if (!organizationField) return;
    
    const commonOrganizations = [
        'Prefeitura Municipal',
        'Governo do Estado',
        'Corpo de Bombeiros',
        'Defesa Civil',
        'Cruz Vermelha',
        'Hospital Regional',
        'Universidade Federal',
        'Universidade Estadual',
        'ONG Humanitária',
        'Empresa Privada'
    ];
    
    organizationField.addEventListener('input', function() {
        const value = this.value.toLowerCase();
        const suggestions = commonOrganizations.filter(org => 
            org.toLowerCase().includes(value)
        );
        
        // Create or update datalist
        let datalist = document.getElementById('organization-suggestions');
        if (!datalist) {
            datalist = document.createElement('datalist');
            datalist.id = 'organization-suggestions';
            document.body.appendChild(datalist);
            organizationField.setAttribute('list', 'organization-suggestions');
        }
        
        datalist.innerHTML = '';
        suggestions.forEach(suggestion => {
            const option = document.createElement('option');
            option.value = suggestion;
            datalist.appendChild(option);
        });
    });
}

// Initialize field suggestions
document.addEventListener('DOMContentLoaded', function() {
    initializeFieldSuggestions();
});

// Error handling and user feedback
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    
    // Show user-friendly error message
    showToast('Ocorreu um erro inesperado. Tente recarregar a página.', 'error');
});

// Prevent form submission on Enter key (except in textarea)
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.form) {
        e.preventDefault();
    }
});

console.log('Contact page ResgateTech loaded successfully!');
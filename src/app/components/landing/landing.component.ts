import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
 
/**
 * LandingComponent - Advanced AI-powered skin disease detection platform
 * 
 * Sections:
 * - Hero: Main banner with CTA
 * - About: Platform introduction
 * - Services: Disease detection capabilities
 * - Team: Medical professionals
 * - Testimonials: User reviews
 * - Contact: Contact form
 * - Footer: Site information
 */
@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {

  constructor(private _Router:Router) { }
  // Scroll effect state
  isScrolled = false;
  
  // Statistics counters
  stats = [
    { icon: 'fa-users', count: 50000, suffix: '+', label: 'Active Users', current: 0 },
    { icon: 'fa-microscope', count: 98, suffix: '%', label: 'Accuracy Rate', current: 0 },
    { icon: 'fa-hospital', count: 500, suffix: '+', label: 'Partner Hospitals', current: 0 },
    { icon: 'fa-shield-alt', count: 100, suffix: '%', label: 'HIPAA Compliant', current: 0 }
  ];

  // About section content
  aboutContent = {
    title: 'Revolutionary AI Technology',
    subtitle: 'Transforming Dermatological Diagnosis',
    description: 'Our cutting-edge artificial intelligence platform combines deep learning algorithms with extensive medical datasets to provide rapid, accurate skin disease detection. We empower healthcare professionals with instant diagnostic insights while maintaining the highest standards of patient privacy and data security.',
    features: [
      {
        icon: 'fa-brain',
        title: 'Deep Learning AI',
        description: 'Advanced neural networks trained on millions of medical images'
      },
      {
        icon: 'fa-clock',
        title: 'Instant Results',
        description: 'Get comprehensive analysis in less than 10 seconds'
      },
      {
        icon: 'fa-lock',
        title: 'Secure & Private',
        description: 'End-to-end encryption with HIPAA compliance'
      },
      {
        icon: 'fa-chart-line',
        title: 'Continuous Learning',
        description: 'AI model improves with every diagnosis'
      }
    ]
  };

  // Services - Diseases we can detect
  services = [
    {
      name: 'Cowpox',
      icon: 'fa-virus',
      description: 'Rare viral infection causing localized skin lesions, typically transmitted through contact with infected animals.',
      accuracy: 96,
      detectionTime: '8s',
      symptoms: ['Red bumps', 'Pustules', 'Scabs', 'Mild fever'],
      color: '#e74c3c'
    },
    {
      name: 'Monkeypox',
      icon: 'fa-disease',
      description: 'Viral disease with distinctive rash patterns, fever, and lymph node swelling requiring immediate medical attention.',
      accuracy: 97,
      detectionTime: '7s',
      symptoms: ['Fever', 'Headache', 'Rash', 'Swollen lymph nodes'],
      color: '#9b59b6'
    },
    {
      name: 'HFMD',
      icon: 'fa-hand-holding-medical',
      description: 'Hand, Foot, and Mouth Disease - Common viral illness in children causing sores and rashes on specific body areas.',
      accuracy: 95,
      detectionTime: '9s',
      symptoms: ['Mouth sores', 'Skin rash', 'Fever', 'Sore throat'],
      color: '#3498db'
    },
    {
      name: 'Measles',
      icon: 'fa-thermometer-full',
      description: 'Highly contagious viral infection characterized by distinctive red, blotchy rash and respiratory symptoms.',
      accuracy: 98,
      detectionTime: '6s',
      symptoms: ['High fever', 'Cough', 'Red rash', 'Watery eyes'],
      color: '#e67e22'
    },
    {
      name: 'Chickenpox',
      icon: 'fa-notes-medical',
      description: 'Contagious viral infection causing itchy blister-like rashes, common in children but preventable with vaccination.',
      accuracy: 97,
      detectionTime: '7s',
      symptoms: ['Itchy blisters', 'Fever', 'Fatigue', 'Loss of appetite'],
      color: '#1abc9c'
    }
  ];

  // Team members
  team = [
    {
      name: 'Dr. Sarah Mitchell',
      role: 'Chief Medical Officer',
      specialty: 'Dermatology & AI Medicine',
      image: 'fa-user-md',
      bio: '15+ years in dermatology with expertise in AI-assisted diagnosis',
      social: {
        linkedin: '#',
        twitter: '#',
        email: 'sarah.mitchell@example.com'
      }
    },
    {
      name: 'Dr. James Chen',
      role: 'Lead AI Researcher',
      specialty: 'Machine Learning & Computer Vision',
      image: 'fa-user-tie',
      bio: 'PhD in AI from MIT, pioneering deep learning in medical imaging',
      social: {
        linkedin: '#',
        twitter: '#',
        email: 'james.chen@example.com'
      }
    },
    {
      name: 'Dr. Emily Rodriguez',
      role: 'Clinical Director',
      specialty: 'Infectious Diseases',
      image: 'fa-user-nurse',
      bio: 'Board-certified in infectious diseases, 20+ years clinical experience',
      social: {
        linkedin: '#',
        twitter: '#',
        email: 'emily.rodriguez@example.com'
      }
    },
    {
      name: 'Dr. Michael O\'Brien',
      role: 'Data Science Lead',
      specialty: 'Healthcare Analytics',
      image: 'fa-user-cog',
      bio: 'Expert in medical data analysis and predictive modeling',
      social: {
        linkedin: '#',
        twitter: '#',
        email: 'michael.obrien@example.com'
      }
    }
  ];

  // Testimonials
  testimonials = [
    {
      name: 'Dr. Amanda Foster',
      role: 'Dermatologist, City Hospital',
      rating: 5,
      text: 'This AI platform has revolutionized our diagnostic workflow. The accuracy is remarkable, and it helps us catch conditions earlier than ever before.',
      avatar: 'fa-user-circle',
      date: 'January 2024'
    },
    {
      name: 'Dr. Robert Kumar',
      role: 'Primary Care Physician',
      rating: 5,
      text: 'As a primary care doctor, this tool gives me confidence in my initial assessments. The instant results help me make better referral decisions.',
      avatar: 'fa-user-circle',
      date: 'December 2023'
    },
    {
      name: 'Jennifer Martinez',
      role: 'Nurse Practitioner',
      rating: 5,
      text: 'User-friendly and incredibly accurate. It\'s become an essential part of our patient care routine. Highly recommend to all healthcare facilities.',
      avatar: 'fa-user-circle',
      date: 'November 2023'
    },
    {
      name: 'Dr. William Zhang',
      role: 'Pediatrician, Children\'s Clinic',
      rating: 5,
      text: 'Especially helpful for pediatric cases. Parents appreciate the quick, professional assessment, and it helps ease their concerns.',
      avatar: 'fa-user-circle',
      date: 'October 2023'
    }
  ];

  // Contact form model
  contactForm = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    userType: 'healthcare'
  };

  // Active testimonial index for carousel
  activeTestimonial = 0;
  
  // Active service for modal
  selectedService: any = null;

  ngOnInit(): void {
    // Animate counters on load
    this.animateCounters();
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 50;
  }

  /**
   * Animate statistics counters
   */
  animateCounters(): void {
    this.stats.forEach(stat => {
      const increment = stat.count / 100;
      const timer = setInterval(() => {
        stat.current += increment;
        if (stat.current >= stat.count) {
          stat.current = stat.count;
          clearInterval(timer);
        }
      }, 20);
    });
  }

  /**
   * Trigger file input for image upload
   */
  triggerFileUpload(): void {
    // const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    // if (fileInput) {
    //   fileInput.click();
    // }

    this._Router.navigate(['/login']);
  }

  /**
   * Handle image upload
   */
  onUploadImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    console.log('Uploading file:', file.name);

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // In production: Upload to backend API
    alert('Image uploaded successfully! AI analysis will begin...');
  }

  /**
   * Smooth scroll to section
   */
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }

  /**
   * Navigate testimonials
   */
  nextTestimonial(): void {
    this.activeTestimonial = (this.activeTestimonial + 1) % this.testimonials.length;
  }

  previousTestimonial(): void {
    this.activeTestimonial = this.activeTestimonial === 0 
      ? this.testimonials.length - 1 
      : this.activeTestimonial - 1;
  }

  /**
   * Open service details modal
   */
  openServiceDetails(service: any): void {
    this.selectedService = service;
  }

  /**
   * Close service details modal
   */
  closeServiceDetails(): void {
    this.selectedService = null;
  }

  /**
   * Generate star rating array
   */
  getStarArray(rating: number): number[] {
    return Array(rating).fill(0);
  }

  /**
   * Submit contact form
   */
  submitContactForm(): void {
    // Validate form
    if (!this.contactForm.name || !this.contactForm.email || !this.contactForm.message) {
      alert('Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.contactForm.email)) {
      alert('Please enter a valid email address');
      return;
    }

    console.log('Contact form submitted:', this.contactForm);

    // In production: Send to backend API
    alert('Thank you for contacting us! We will get back to you within 24 hours.');

    // Reset form
    this.contactForm = {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      userType: 'healthcare'
    };
  }

  /**
   * Get current year for footer
   */
  getCurrentYear(): number {
    return new Date().getFullYear();
  }
}
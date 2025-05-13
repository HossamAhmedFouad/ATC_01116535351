import { Component, AfterViewInit, ViewChild, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements AfterViewInit {
  @ViewChildren('featureSection') featureSections!: QueryList<ElementRef>;
  @ViewChild('ctaSection') ctaSection!: ElementRef;
  @ViewChild('statsSection') statsSection!: ElementRef;

  currentSlide = 0;
  autoSlideInterval: any;
  isStatsVisible = false;
  isCtaVisible = false;

  stats = [
    { label: 'Active Users', target: 10000, current: 0, suffix: '+' },
    { label: 'Events Monthly', target: 500, current: 0, suffix: '+' },
    { label: 'Cities Covered', target: 50, current: 0, suffix: '+' },
    { label: 'Satisfaction Rate', target: 98, current: 0, suffix: '%' }
  ];

  features = [
    {
      icon: '📅',
      title: 'Stay Updated',
      description: 'Get real-time notifications about the most recent and trending events in your area. Never miss out on what matters to you.',
      isVisible: false,
      highlights: [
        'Real-time event notifications',
        'Trending events in your area',
        'Customizable alerts'
      ]
    },
    {
      icon: '⭐',
      title: 'Personalized Experience',
      description: 'Create your own curated list of favorite events. Get recommendations based on your interests and past bookings.',
      isVisible: false,
      highlights: [
        'Personalized recommendations',
        'Save favorite events',
        'Smart event suggestions'
      ]
    },
    {
      icon: '🔒',
      title: 'Secure Payments',
      description: 'Enjoy peace of mind with our state-of-the-art secure payment system. Multiple payment options available.',
      isVisible: false,
      highlights: [
        'Encrypted transactions',
        'Multiple payment methods',
        'Instant confirmation'
      ]
    },
    {
      icon: '👑',
      title: 'VIP Access',
      description: 'Exclusive access to premium events, early bird tickets, and special member-only experiences.',
      isVisible: false,
      highlights: [
        'Early access to tickets',
        'Exclusive VIP events',
        'Premium member benefits'
      ]
    }
  ];

  testimonials = [
    {
      text: "The event registration process was seamless and the platform is incredibly user-friendly. I've discovered so many amazing events!",
      name: "Sarah Johnson",
      title: "Event Enthusiast",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
    },
    {
      text: "As an event organizer, this platform has made it so much easier to manage registrations and communicate with attendees.",
      name: "Michael Chen",
      title: "Event Organizer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
    },
    {
      text: "The personalized recommendations are spot on! I've found events I never would have discovered otherwise.",
      name: "Emma Davis",
      title: "Regular User",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
    }
  ];

  upcomingEvents = [
    {
      id: 1,
      title: "Tech Conference 2024",
      date: "March 15-17, 2024",
      description: "Join us for the biggest tech conference of the year featuring industry leaders and innovative workshops.",
      location: "San Francisco, CA",
      price: "From $299",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 2,
      title: "Music Festival",
      date: "April 20-22, 2024",
      description: "A three-day celebration of music featuring top artists from around the world.",
      location: "Austin, TX",
      price: "From $199",
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 3,
      title: "Food & Wine Expo",
      date: "May 5-7, 2024",
      description: "Experience the finest cuisines and wines from renowned chefs and wineries.",
      location: "Chicago, IL",
      price: "From $149",
      image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    }
  ];

  ngAfterViewInit() {
    this.setupIntersectionObserver();
    this.startAutoSlide();
  }

  ngOnDestroy() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  private setupIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (entry.target.classList.contains('feature-section')) {
            const index = this.featureSections.toArray().findIndex(
              section => section.nativeElement === entry.target
            );
            if (index !== -1) {
              this.features[index].isVisible = true;
            }
          } else if (entry.target.classList.contains('cta-content')) {
            this.isCtaVisible = true;
          } else if (entry.target === this.statsSection.nativeElement) {
            this.isStatsVisible = true;
            this.animateStats();
          }
        }
      });
    }, options);

    // Observe all feature sections
    this.featureSections.forEach(section => {
      observer.observe(section.nativeElement);
    });

    // Observe CTA section
    if (this.ctaSection) {
      observer.observe(this.ctaSection.nativeElement);
    }

    // Observe Stats section
    if (this.statsSection) {
      observer.observe(this.statsSection.nativeElement);
    }
  }

  private animateStats() {
    const duration = 2000; // 2 seconds
    const steps = 60; // 60 steps for smooth animation
    const stepDuration = duration / steps;

    this.stats.forEach(stat => {
      const increment = stat.target / steps;
      let current = 0;
      const interval = setInterval(() => {
        current += increment;
        if (current >= stat.target) {
          current = stat.target;
          clearInterval(interval);
        }
        stat.current = Math.floor(current);
      }, stepDuration);
    });
  }

  private startAutoSlide() {
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000); // Change slide every 5 seconds
  }

  nextSlide() {
    if (this.currentSlide < this.features.length - 1) {
      this.currentSlide++;
      this.updateSlideVisibility();
    }
  }

  prevSlide() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
      this.updateSlideVisibility();
    }
  }

  goToSlide(index: number) {
    this.currentSlide = index;
    this.updateSlideVisibility();
  }

  private updateSlideVisibility() {
    this.features.forEach((feature, index) => {
      feature.isVisible = index === this.currentSlide;
    });
  }

  subscribeNewsletter() {
    // Implement newsletter subscription logic
    console.log('Newsletter subscription');
  }
} 
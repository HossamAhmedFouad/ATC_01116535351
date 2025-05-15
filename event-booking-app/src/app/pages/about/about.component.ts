import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TeamMember {
  name: string;
  role: string;
  image: string;
  bio: string;
}

interface Milestone {
  year: string;
  title: string;
  description: string;
}

interface Value {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
})
export class AboutComponent {
  teamMembers: TeamMember[] = [
    {
      name: 'Hossam Ahmed Fouad',
      role: 'CEO & Founder',
      image: '../../assets/images/Hossam_CEO.png',
      bio: 'With over 15 years of experience in event management, Hossam leads our team with vision and expertise.',
    },
    {
      name: 'Jane Smith',
      role: 'Event Director',
      image:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHByb2Zlc3Npb25hbCUyMHdvbWFufGVufDB8fDB8fHww',
      bio: 'Jane brings creativity and precision to every event, ensuring memorable experiences for all attendees.',
    },
    {
      name: 'Mike Johnson',
      role: 'Technical Lead',
      image:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fHByb2Zlc3Npb25hbCUyMG1hbnxlbnwwfHwwfHx8MA%3D%3D',
      bio: 'Mike oversees our technical infrastructure, ensuring seamless event registration and management.',
    },
  ];

  milestones: Milestone[] = [
    {
      year: '2020',
      title: 'Our Beginning',
      description:
        'Founded with a vision to revolutionize event management through technology.',
    },
    {
      year: '2021',
      title: 'First Major Event',
      description:
        'Successfully managed our first large-scale conference with over 1,000 attendees.',
    },
    {
      year: '2022',
      title: 'Platform Launch',
      description:
        'Launched our comprehensive event management platform, making event organization more accessible.',
    },
    {
      year: '2023',
      title: 'Global Expansion',
      description:
        'Expanded our services to international markets, serving clients across multiple continents.',
    },
  ];

  values: Value[] = [
    {
      icon: 'fas fa-users',
      title: 'Community First',
      description:
        'We believe in building strong communities through meaningful events and connections.',
    },
    {
      icon: 'fas fa-lightbulb',
      title: 'Innovation',
      description:
        'Constantly pushing boundaries to create better event experiences through technology.',
    },
    {
      icon: 'fas fa-heart',
      title: 'Passion',
      description:
        'Our team is driven by a genuine passion for creating memorable event experiences.',
    },
    {
      icon: 'fas fa-handshake',
      title: 'Integrity',
      description:
        'We maintain the highest standards of professionalism and ethical business practices.',
    },
  ];
}

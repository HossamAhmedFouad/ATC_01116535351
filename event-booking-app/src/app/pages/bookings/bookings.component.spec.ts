import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookingsComponent } from './bookings.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { BookingService } from '../../services/booking.service';
import { EventService } from '../../services/event.service';
import { TicketService } from '../../services/ticket.service';

describe('BookingsComponent', () => {
  let component: BookingsComponent;
  let fixture: ComponentFixture<BookingsComponent>;
  let bookingServiceSpy: jasmine.SpyObj<BookingService>;
  let eventServiceSpy: jasmine.SpyObj<EventService>;
  let ticketServiceSpy: jasmine.SpyObj<TicketService>;

  beforeEach(async () => {
    const bookingSpy = jasmine.createSpyObj('BookingService', [
      'getUserBookings',
      'cancelBooking',
    ]);
    const eventSpy = jasmine.createSpyObj('EventService', [
      'getEvents',
      'getEvent',
    ]);
    const ticketSpy = jasmine.createSpyObj('TicketService', [
      'getTicketsForBooking',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MatSnackBarModule,
        MatDialogModule,
        NoopAnimationsModule,
        RouterTestingModule,
        BookingsComponent,
      ],
      providers: [
        { provide: BookingService, useValue: bookingSpy },
        { provide: EventService, useValue: eventSpy },
        { provide: TicketService, useValue: ticketSpy },
      ],
    }).compileComponents();

    bookingServiceSpy = TestBed.inject(
      BookingService
    ) as jasmine.SpyObj<BookingService>;
    eventServiceSpy = TestBed.inject(
      EventService
    ) as jasmine.SpyObj<EventService>;
    ticketServiceSpy = TestBed.inject(
      TicketService
    ) as jasmine.SpyObj<TicketService>;

    // Mock responses
    bookingServiceSpy.getUserBookings.and.returnValue(of([]));
    eventServiceSpy.getEvents.and.returnValue(of([]));

    fixture = TestBed.createComponent(BookingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user bookings on init', () => {
    expect(eventServiceSpy.getEvents).toHaveBeenCalled();
    expect(bookingServiceSpy.getUserBookings).toHaveBeenCalled();
  });

  // Add more tests as needed
});

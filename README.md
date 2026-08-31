# FleetFlow: Drive Smarter

FleetFlow — Master Frontend Development Prompt

0. ROLE

You are designing and implementing the complete frontend for FleetFlow, a premium full-stack vehicle rental and fleet management platform.

This is NOT a generic car rental landing page.

FleetFlow is being developed as a serious full-stack portfolio/project application with a relational DBMS foundation, customer-facing rental workflows, an admin fleet-management system, AI-assisted functionality, document/OCR workflows, analytics, maintenance management, payments, and future ML capabilities.

The frontend must therefore be designed as a real product, with a coherent information architecture, realistic workflows, high-quality visual design, reusable components, responsive behavior, loading states, empty states, error states, and clean separation between UI and future backend services.

The backend will be implemented separately later using another development environment. Therefore, build the frontend so that backend services can be connected cleanly without redesigning the UI.

1. CORE PRODUCT VISION

Product name:

FleetFlow

Positioning:

Intelligent Vehicle Rental & Fleet Management Platform

The product should combine:

Premium vehicle rental experience

Fleet management

Booking management

Customer management

Employee management

Maintenance tracking

Payment management

Document verification

AI-assisted search and booking

AI recommendations

Analytics

Future predictive fleet insights

The experience should feel like a combination of:

premium automotive brand

modern mobility platform

sophisticated SaaS dashboard

Do NOT make it look like:

a basic Bootstrap template

a generic admin dashboard

a typical college CRUD project

a random AI-generated SaaS template

an ecommerce store

2. IMPORTANT DEVELOPMENT BOUNDARY

For this phase:

BUILD

Complete frontend

Routing

Navigation

Layouts

UI components

Animations

Interactions

Forms

Validation UX

Search and filtering UI

Booking flow UI

Customer dashboard

Admin dashboard

Analytics UI

AI interfaces

OCR/document interfaces

Payment UI

Maintenance UI

Notifications UI

Responsive design

Mock data

Loading states

Empty states

Error states

API-ready service abstractions

DO NOT BUILD

Do not create a real production backend yet.

Do not hardcode frontend components directly around a future database implementation.

Do not create fake authentication that pretends to be secure.

Do not connect to arbitrary third-party APIs unless explicitly required for a visual prototype.

Do not tightly couple components to mock data.

Instead, create clean mock service/data layers that can later be replaced by real API calls.

3. TECHNOLOGY

Use:

Next.js

React

TypeScript

Tailwind CSS

Framer Motion for UI animation

Lucide React or another consistent icon library

Use the Next.js App Router.

Use reusable components and a clear component architecture.

Avoid unnecessary dependencies.

Do not use Python in the frontend.

Future Python/ML services will be connected later through APIs.

4. DESIGN DIRECTION

The visual identity should be:

Luxury automotive × futuristic mobility × premium SaaS

Think:

cinematic

sophisticated

spacious

technical

premium

modern

restrained

highly polished

Avoid excessive:

gradients

neon

glassmorphism everywhere

floating cards everywhere

huge rounded rectangles

generic purple AI aesthetics

excessive shadows

childish animations

Use visual hierarchy rather than decoration.

The design should look credible enough that it could be a commercial mobility startup.

5. COLOR SYSTEM

Use a sophisticated automotive palette.

Primary:

near-black / charcoal

white / off-white

graphite

muted metallic gray

Accent:

one distinctive FleetFlow accent color

The accent should be used for:

CTA buttons

active states

availability

important metrics

interactive elements

Do not use 6–8 random accent colors.

Status colors may be used semantically:

green = available / successful

amber = pending / warning

red = unavailable / error

blue = informational

6. TYPOGRAPHY

Typography should feel premium.

Use a strong modern sans-serif.

Use:

large editorial headlines

compact labels

readable body text

strong numerical typography for dashboard metrics

Do not use oversized text on every section.

7. MOTION DESIGN

Motion is an important part of the product.

Use animation deliberately.

Examples:

vehicle image entering the hero

subtle vehicle movement/parallax

smooth page transitions

card hover interactions

animated filters

booking step transitions

dashboard metric transitions

smooth chart rendering

modal transitions

loading skeletons

AI response streaming simulation

successful booking animation

Vehicle movement is welcome.

However:

Do not make cars randomly fly around the page.

Animations should communicate:

movement

transition

progress

availability

interaction

The website should remain fast and professional.

Respect reduced-motion accessibility preferences.

8. RESPONSIVE DESIGN

The entire application must work on:

desktop

laptop

tablet

mobile

Do not design desktop first and simply stack everything on mobile.

Important mobile experiences:

navigation

vehicle browsing

vehicle details

booking

payment

customer dashboard

admin tables

9. APPLICATION STRUCTURE

There are two major experiences:

CUSTOMER APPLICATION

Routes conceptually:

/

/explore

/vehicles/[id]

/booking

/booking/[id]

/bookings

/bookings/[id]

/documents

/payments

/recommendations

/assistant

/profile

ADMIN APPLICATION

Routes conceptually:

/admin

/admin/vehicles

/admin/vehicles/[id]

/admin/bookings

/admin/bookings/[id]

/admin/customers

/admin/employees

/admin/maintenance

/admin/payments

/admin/analytics

/admin/ai-insights

/admin/settings

Do not necessarily expose every route in the first navigation if it makes the UI crowded.

10. GLOBAL NAVIGATION

Customer navigation:

FleetFlow logo

Explore

Vehicles

How it Works

Recommendations

AI Assistant

Right side:

Notifications

Profile

Login / Dashboard

Primary CTA:

Find a Vehicle

Admin navigation:

FleetFlow

Overview
Vehicles
Bookings
Customers
Employees
Maintenance
Payments
Analytics
AI Insights

Bottom:

Settings
Profile

11. LANDING PAGE

The homepage should be one of the strongest parts of the entire project.

HERO

Do NOT create a generic:

"Rent a car today"

hero.

Instead create a cinematic automotive composition.

Possible direction:

Large headline:

MOVE WITHOUT LIMITS.

Supporting text:

A premium vehicle rental platform designed around availability, intelligence, and effortless journeys.

Primary CTA:

Explore Fleet

Secondary CTA:

How FleetFlow Works

Hero visual:

A premium vehicle prominently displayed.

Allow subtle vehicle animation/parallax.

Possible background:

dark studio environment

road-inspired lighting

abstract motion

subtle grid / map lines

Do not overdo the background.

12. HOMEPAGE SECTIONS

Include:

Hero

Search / Booking Widget

User can select:

pickup location

drop-off location

start date

end date

vehicle type

CTA:

Search Vehicles

Featured Fleet

Show premium vehicle cards.

Each card:

vehicle image

name

category

transmission

fuel

seats

price/day

availability

CTA

Why FleetFlow

3–4 strong capabilities:

Verified vehicles

Flexible booking

Smart recommendations

Transparent pricing

How It Works

04 steps:

01 Discover
02 Reserve
03 Drive
04 Return

AI Section

Introduce:

Your rental, understood.

Example:

"Find me an automatic SUV for 4 people under ₹3000."

CTA:

Try FleetFlow AI

Fleet statistics

Example mock values:

250+ Vehicles
18 Locations
12K+ Rentals
4.9 Average Rating

Use realistic-looking mock data.

Testimonials

Use a small number of believable testimonials.

Do not make them obviously AI-generated.

Final CTA

"Your next journey starts here."

13. EXPLORE VEHICLES

Create a premium vehicle discovery page.

Layout:

Search/filter area

Filters:

Vehicle type

Price range

Fuel type

Transmission

Seating capacity

Location

Availability

Rating

Sorting:

Recommended

Price: Low to High

Price: High to Low

Popular

Newest

Vehicle cards should be visually strong.

Use realistic vehicle images.

Do not use inconsistent image styles.

14. VEHICLE CARD

Reusable component.

Show:

Vehicle image

Vehicle name

Category

Transmission

Fuel

Seats

Rating

Price/day

Availability status

CTA:

View Details

On hover:

subtle image movement

information reveal

premium interaction

15. VEHICLE DETAILS PAGE

This should feel cinematic.

Hero:

Large vehicle gallery.

Information:

Vehicle name
Rating
Location
Availability

Specs:

Seats

Transmission

Fuel

Mileage

Vehicle type

Sections:

Overview
Features
Specifications
Rental Policy
Availability
Reviews

Sticky booking panel:

Price/day

Pickup date

Return date

Location

CTA:

Reserve Vehicle

16. BOOKING FLOW

Create a multi-step booking experience.

Steps:

01 Vehicle
02 Schedule
03 Customer
04 Documents
05 Review
06 Payment
07 Confirmation

Use a visible progress indicator.

17. BOOKING STEP 1

Selected vehicle.

Allow changing vehicle.

18. BOOKING STEP 2

Date/time selection.

Show:

availability calendar

pickup location

return location

estimated rental duration

Unavailable dates should be visually disabled.

19. BOOKING STEP 3

Customer information.

Fields:

Name
Email
Phone
DOB
License number

Do not make the form feel like a boring database form.

Use grouped sections and progressive disclosure.

20. BOOKING STEP 4 — DOCUMENT VERIFICATION

Create a polished document upload experience.

Heading:

Verify your driving credentials

Upload:

driving license

Show:

Drag & drop area

Camera/upload icon

After upload:

Show OCR processing animation.

Example:

"Reading document..."

Then display:

Extracted information

Name
License Number
DOB
Expiry Date

Allow user to verify/edit extracted fields.

Important:

Never present OCR output as automatically trusted.

Add:

Confirm Details

21. BOOKING STEP 5 — REVIEW

Show:

Vehicle
Dates
Locations
Customer
Documents
Price breakdown

Example:

Vehicle rental
₹7,497

Taxes
₹1,349

Insurance
₹499

Total
₹9,345

CTA:

Proceed to Payment

22. PAYMENT PAGE

Create a premium checkout UI.

Payment methods:

Card

UPI

Other mock options

Show booking summary.

Payment status states:

processing

successful

failed

cancelled

After success:

Animated confirmation.

23. BOOKING CONFIRMATION

Create a strong success page.

Show:

Booking confirmed

Booking ID

Vehicle

Pickup

Return

Date

Total amount

Actions:

Download Agreement
View Booking
Go to Dashboard

24. CUSTOMER DASHBOARD

The customer dashboard should NOT resemble the admin dashboard.

Top:

"Good morning, [Name]."

Upcoming booking prominently displayed.

Sections:

Upcoming Journey

Recent Rentals

Saved Vehicles

Recommended For You

Payment Summary

Documents

Quick actions:

Book a vehicle
View bookings
Upload document
Open AI Assistant

25. MY BOOKINGS

Tabs:

Upcoming
Active
Completed
Cancelled

Booking cards should show:

Vehicle
Booking ID
Dates
Status
Amount

Actions:

View
Modify
Cancel
Download Agreement

26. BOOKING DETAILS

Show complete rental information.

Vehicle
Customer
Pickup
Return
Payment
Agreement
Status

Timeline:

Booked
Confirmed
Pickup
Active
Returned
Completed

27. DOCUMENTS

Customer document center.

Show:

Driving License
Rental Agreement
Invoices
Payment Receipts

Actions:

View
Download
Replace

Status:

Verified
Pending
Expired
Rejected

28. AI ASSISTANT

This is one of FleetFlow's signature features.

Create a dedicated AI interface.

It should feel integrated with FleetFlow, not like a random ChatGPT clone.

Header:

FleetFlow Intelligence

Subheading:

"Tell me what you need. I'll find the right vehicle."

Suggested prompts:

"Find an SUV for 5 people."

"Show automatic cars under ₹2500."

"What's my next booking?"

"Recommend something similar to my last rental."

Chat UI:

User messages
AI responses
Vehicle recommendation cards
Action buttons

Example AI response:

"I found 3 vehicles matching your requirements."

Then show vehicle cards.

The assistant should be visually capable of:

searching

recommending

showing booking information

initiating booking flow

For this frontend phase, simulate responses with mock data.

Structure the code so real AI APIs can replace the mock service later.

29. RECOMMENDATIONS

Create:

Recommended for You

Use mock recommendation logic.

Show:

Because you previously rented...

You may like...

Popular near you...

Budget matches...

This should look intelligent without pretending the current frontend has real ML.

30. ADMIN DASHBOARD

The admin interface should feel like a high-quality enterprise SaaS application.

Layout:

Persistent sidebar.

Top navigation:

Search
Notifications
Profile

Main dashboard.

31. ADMIN OVERVIEW

Metrics:

Revenue
Active Rentals
Fleet Utilization
Available Vehicles
Vehicles in Maintenance
Pending Payments

Charts:

Revenue trend

Bookings over time

Vehicle utilization

Vehicle category distribution

Recent bookings

Maintenance alerts

32. VEHICLE MANAGEMENT

Table with:

Vehicle
Registration
Type
Status
Location
Current renter
Last service
Next service

Actions:

View
Edit
Archive

Filters:

Available
Reserved
Rented
Maintenance
Inactive

Add vehicle flow:

Basic details
Specifications
Pricing
Location
Images
Availability
Maintenance information

33. VEHICLE DETAIL — ADMIN

Show:

Vehicle information

Current status

Current booking

Rental history

Maintenance history

Revenue generated

Utilization

Documents

Images

Actions:

Edit
Change status
Schedule maintenance
View bookings

34. BOOKING MANAGEMENT

Admin booking table:

Booking ID
Customer
Vehicle
Start
End
Amount
Status

Filters:

Confirmed
Active
Completed
Cancelled
Pending

Admin can:

View booking
Approve
Cancel
Modify
Process return

35. CUSTOMER MANAGEMENT

Customer table:

Customer
Phone
License
Total bookings
Total spend
Last rental
Status

Customer detail:

Profile
Rental history
Payments
Documents
Reviews
Activity

36. EMPLOYEE MANAGEMENT

Reflect the DBMS model.

Employee roles:

Salesperson
Mechanic
Manager

Use the ISA concept from the DBMS model.

Do not make these unrelated user types.

Show:

Employee ID
Name
Role
Contact
Status

Role-specific information:

Salesperson:
Target
Commission

Mechanic:
Specialization
Shift

Manager:
Branch

37. MAINTENANCE MANAGEMENT

Show:

Vehicle
Maintenance status
Last service
Next service
Cost
Mechanic
Description

Statuses:

Scheduled
In Progress
Completed
Overdue

Maintenance detail page should include history.

38. AI MAINTENANCE INSIGHTS

Create a separate intelligence panel.

Example:

"Vehicle V104 has unusually frequent maintenance compared with similar vehicles."

"Vehicle V112 has exceeded its typical service interval."

"Maintenance spending for SUVs increased 14% this month."

These are mock insights for now.

Design them as recommendations, not unquestionable AI decisions.

39. PAYMENTS

Admin payment table:

Payment ID
Customer
Booking
Amount
Date
Method
Status

Statuses:

Paid
Pending
Failed
Refunded

Payment detail page.

40. ANALYTICS

Create a sophisticated analytics section.

Filters:

Date range
Vehicle category
Location
Vehicle
Customer segment

Charts:

Revenue
Bookings
Utilization
Average rental duration
Cancellation rate
Maintenance spending

Include data tables beneath important charts.

41. AI INSIGHTS

Create a separate AI-powered analytics page.

Sections:

Demand Forecast

Fleet Utilization Insight

Revenue Insight

Maintenance Insight

Customer Insight

Example:

"Weekend demand for SUVs is expected to be higher than the current weekly average."

"Vehicle category X has the highest revenue per available day."

Again, use mock data now.

Create clean interfaces for future ML/API integration.

42. NOTIFICATIONS

Global notification system.

Examples:

Booking confirmed
Payment successful
Return reminder
Document verification complete
Maintenance alert
AI recommendation

Use notification drawer/popover.

43. PROFILE

Customer profile:

Personal details
Contact
License information
Documents
Preferences
Saved vehicles
Security

Admin profile can contain:

Role
Employee information
Permissions
Activity

44. AUTHENTICATION UI

Create polished frontend screens for:

Login
Sign up
Forgot password
Reset password
Email verification

Do not implement insecure fake authentication.

Use mock authenticated states for frontend development.

Create clear placeholders for future authentication service integration.

45. GLOBAL SEARCH

Create a command-palette style search.

Users can search:

Vehicles
Bookings
Customers
Documents

Admin users should be able to search across the management system.

Example:

CMD/CTRL + K

46. GLOBAL AI ENTRY POINT

Include a small FleetFlow AI entry point throughout the application.

It can appear as:

floating assistant button

command bar

contextual assistant

But do not make it annoying.

It should be subtle and premium.

47. LOADING STATES

Every major page needs loading states.

Use skeletons rather than blank screens.

Examples:

Vehicle card skeleton
Dashboard metric skeleton
Table skeleton
Booking skeleton
AI response skeleton

48. EMPTY STATES

Create intentional empty states.

Examples:

"No upcoming bookings."

"No maintenance records."

"No saved vehicles."

"No payments yet."

Include useful CTA.

49. ERROR STATES

Create polished error states.

Examples:

Vehicle unavailable
Booking failed
Payment failed
Document processing failed
Network error
AI unavailable

Never simply show:

"Something went wrong."

Give the user an action.

50. DATA ARCHITECTURE

Use mock data through structured TypeScript types.

Create interfaces/types for:

Customer
Employee
Salesperson
Mechanic
Manager
Vehicle
RentalAgreement
Booking
Payment
MaintenanceRecord
Document
Review
Notification
Recommendation
AIMessage

Do not scatter mock objects throughout components.

Create centralized mock data/service files.

Example conceptual structure:

/lib/mock-data
/lib/services
/types

Future backend calls should be replaceable without rewriting UI components.

51. API-READY ARCHITECTURE

Create service abstractions such as:

vehicleService
bookingService
customerService
paymentService
maintenanceService
documentService
recommendationService
aiService

Initially these can return mock data.

Later they will call real APIs.

Do not put API fetch logic directly into every component.

52. DBMS ALIGNMENT

The frontend must reflect the original relational model.

Core entities:

Customer
Employee
Salesperson
Mechanic
Manager
Vehicle
Rental Agreement
Payment
Maintenance Record

Relationships:

Customer ↔ Salesperson
Employee → Salesperson / Mechanic / Manager
Mechanic ↔ Vehicle
Customer → Vehicle
Customer → Payment
Customer → Rental Agreement
Vehicle → Maintenance Record

Books and Services are junction-table concepts.

Maintenance Record is treated as a weak entity dependent on Vehicle.

The frontend should not expose database terminology unnecessarily to customers, but the UI workflows must correspond to these relationships.

53. IMPORTANT BOOKING LOGIC UX

The frontend must visually communicate availability.

If a vehicle is unavailable:

Do not allow the user to proceed as if it is available.

Show:

Unavailable for selected dates

Suggest alternatives.

Example:

"This vehicle is unavailable from Aug 24–26."

Then:

"Try similar vehicles"

This prepares the UI for the future backend's conflict-prevention logic.

54. PREMIUM MICROINTERACTIONS

Implement carefully:

magnetic-style CTA hover where appropriate

vehicle image transitions

smooth tabs

animated booking progress

hover spec reveals

animated status badges

subtle chart animation

number count-up

page transitions

smooth modals

elegant dropdowns

Do NOT animate everything.

55. ACCESSIBILITY

Ensure:

keyboard navigation

focus states

semantic HTML

sufficient contrast

screen-reader-friendly labels

reduced motion support

accessible dialogs

accessible forms

56. PERFORMANCE

Do not sacrifice performance for visual effects.

Use:

optimized images

lazy loading

appropriate Next.js image handling

code splitting where useful

lightweight animations

Avoid unnecessarily huge libraries.

57. MOCK DATA

Create realistic mock data.

Use at least:

15–20 vehicles
20+ customers
multiple employees
multiple bookings
multiple maintenance records
multiple payments
multiple reviews
multiple notifications

Create relationships between them so the application feels alive.

For example:

A vehicle should have:

booking history

maintenance history

utilization

revenue

A customer should have:

bookings

payments

documents

recommendations

58. VISUAL CONSISTENCY

Create a reusable design system.

Components should include:

Button
Input
Select
Modal
Drawer
Tabs
Badge
Card
VehicleCard
MetricCard
Table
DataTable
Calendar
BookingStepper
StatusBadge
Toast
Dropdown
Tooltip
Skeleton
EmptyState
ErrorState
AIMessage
AIRecommendationCard
DocumentUpload
PaymentSummary

Do not duplicate styles unnecessarily.

59. DO NOT OVERDESIGN

Premium does NOT mean:

everything is glass

everything glows

everything moves

everything is rounded

huge gradients

excessive 3D

Use restraint.

The strongest pages should have visual hierarchy and whitespace.

60. FRONTEND PHASE SUCCESS CRITERIA

When finished, I should be able to navigate through FleetFlow as if it were a real product.

A customer should be able to:

Visit homepage.

Search vehicles.

Filter vehicles.

Open vehicle details.

Select dates.

Start booking.

Upload a mock license.

See OCR processing.

Verify extracted details.

Review booking.

See payment screen.

Complete mock payment.

See confirmation.

View booking history.

View documents.

Open AI assistant.

Receive mock recommendations.

An admin should be able to:

Open dashboard.

View metrics.

Manage vehicles.

View bookings.

Manage customers.

Manage employees.

View maintenance.

View payments.

Explore analytics.

View AI insights.

61. MOST IMPORTANT VISUAL REQUIREMENT

Do not generate the entire project as a collection of generic dashboard pages.

The application must have a distinct visual identity.

The landing page should feel automotive.

The customer application should feel like a premium mobility product.

The admin application should feel like sophisticated fleet-management software.

The AI assistant should feel integrated into FleetFlow's product identity.

The booking process should feel polished and trustworthy.

62. IMPLEMENTATION ORDER

Build in this order:

Phase 1

Design system + global components

Phase 2

Homepage

Phase 3

Vehicle discovery

Phase 4

Vehicle details

Phase 5

Booking workflow

Phase 6

Customer dashboard

Phase 7

Admin dashboard

Phase 8

Vehicle / booking / customer / employee management

Phase 9

Maintenance

Phase 10

Payments

Phase 11

Documents + OCR UI

Phase 12

AI Assistant

Phase 13

Recommendations

Phase 14

Analytics

Phase 15

AI Insights

Phase 16

Responsive polish + animations + accessibility + error/loading states

63. FINAL INSTRUCTION

Before implementing large sections, establish a coherent component architecture and route structure.

Do not repeatedly rebuild the same component in different pages.

Do not use placeholder lorem ipsum.

Do not use generic stock dashboard copy.

Use realistic FleetFlow terminology and realistic mock data.

Make the application feel like one coherent product.

The final frontend should be production-quality in visual design and architecture, even though the backend is currently mocked.

The backend will be connected later through clean service/API boundaries.

Most importantly:

Build FleetFlow as a real product, not as a DBMS assignment with a UI placed on top.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7fb7e7cd-afe5-4aa8-997c-75fe5d995ef7).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

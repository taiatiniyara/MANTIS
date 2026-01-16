# Glossary

Key terms and definitions used in MANTIS.

## A

**Agency**  
An enforcement organization (e.g., LTA, Fiji Police, Municipal Council) that operates within MANTIS with data isolation.

**Agency Admin**  
A user role with authority to manage users, teams, and settings within a single agency.

**Appeal**  
A formal request by a driver to contest an infringement, reviewed by agency administrators.

**Audit Log**  
A permanent record of all significant actions within the system for compliance and security.

**Authentication**  
The process of verifying a user's identity, typically through email and password.

**Authorization**  
The process of determining what actions an authenticated user is allowed to perform.

## B

**Background Sync**  
Automatic synchronization of offline changes when internet connection is restored.

**Boundary**  
A geographic polygon defining the limits of a jurisdiction or location.

## C

**Cache**  
Temporary storage of data for faster access and offline functionality.

**CDN (Content Delivery Network)**  
A distributed network of servers that delivers static assets quickly to users.

**CORS (Cross-Origin Resource Sharing)**  
Security mechanism that controls which domains can access API resources.

**CSP (Content Security Policy)**  
HTTP header that helps prevent cross-site scripting attacks.

## D

**Division**  
A top-level administrative region in Fiji (e.g., Central, Northern, Eastern, Western).

**Driver**  
A person holding a driver's license who may receive infringements.

**Drizzle ORM**  
Type-safe database query builder used in MANTIS for database operations.

## E

**Edge Function**  
Serverless function running close to users for low latency operations.

**EPSG:4326**  
Standard coordinate reference system (WGS 84) used for GPS coordinates.

**Evidence File**  
Photo or video documentation attached to an infringement.

## F

**Fine Amount**  
Monetary penalty assessed for a traffic infringement, stored in cents (FJD).

## G

**GeoJSON**  
JSON format for encoding geographic data structures (points, polygons, etc.).

**GIS (Geographic Information System)**  
System for managing and analyzing geographic/spatial data.

**GPS (Global Positioning System)**  
Satellite navigation system providing location coordinates.

## H

**HMR (Hot Module Replacement)**  
Development feature that updates code without full page reload.

## I

**IndexedDB**  
Browser database for storing large amounts of structured data offline.

**Infringement**  
A recorded violation of traffic laws, including driver, vehicle, location, and penalty information.

## J

**Jurisdiction**  
The geographic area and legal authority under which an agency operates.

**JWT (JSON Web Token)**  
Secure method of transmitting information between parties as a JSON object.

## L

**Location**  
A place in the hierarchical geographic structure (country → division → office).

## M

**MANTIS**  
Multi-Agency National Traffic Infringement System.

**MapLibre GL**  
Open-source library for rendering interactive maps with vector tiles.

**Municipal Council**  
Local government authority with enforcement jurisdiction in specific areas.

## N

**Node.js**  
JavaScript runtime environment used for development tools and build processes.

## O

**Officer**  
Field personnel authorized to issue infringements within their agency.

**Offense Code**  
Standardized identifier for specific traffic violations (e.g., "PARK-01").

**Offline-First**  
Design approach prioritizing functionality without internet connection.

## P

**Payment**  
Financial transaction settling an infringement penalty.

**Point-in-Polygon**  
GIS operation determining if a coordinate falls within a boundary.

**PostGIS**  
PostgreSQL extension adding support for geographic objects and spatial queries.

**PostgreSQL**  
Open-source relational database system used by Supabase.

**Province**  
Administrative subdivision within a division in Fiji.

**PWA (Progressive Web App)**  
Web application using modern APIs to deliver app-like experience.

## R

**RBAC (Role-Based Access Control)**  
Security model assigning permissions based on user roles.

**React**  
JavaScript library for building user interfaces.

**RLS (Row Level Security)**  
PostgreSQL feature controlling which rows users can access in database tables.

## S

**Service Worker**  
Background script enabling offline functionality and caching.

**Session**  
Authenticated period during which a user is logged in.

**Supabase**  
Open-source Firebase alternative providing authentication, database, and storage.

**Super Admin**  
User role with system-wide administrative privileges across all agencies.

## T

**TanStack Query**  
Library for fetching, caching, and synchronizing server state.

**TanStack Router**  
Type-safe routing solution for React applications.

**Team**  
Group of officers within an agency, often associated with a specific location.

**Team Leader**  
User role with authority to supervise a team and its operations.

**TypeScript**  
Typed superset of JavaScript providing enhanced tooling and error checking.

## U

**User**  
Person with authenticated access to MANTIS (officer, admin, etc.).

**UUID (Universally Unique Identifier)**  
128-bit identifier guaranteed to be unique across tables and databases.

## V

**Vehicle**  
Registered motorized transport that can receive infringements.

**Vite**  
Modern build tool and development server optimized for speed.

## W

**Ward**  
Smallest administrative division within a municipal area.

**WebSocket**  
Protocol providing full-duplex communication for real-time updates.

## Abbreviations

| Abbreviation | Full Term |
|--------------|-----------|
| **API** | Application Programming Interface |
| **APAC** | Asia-Pacific |
| **CI/CD** | Continuous Integration/Continuous Deployment |
| **CLI** | Command Line Interface |
| **CSS** | Cascading Style Sheets |
| **DB** | Database |
| **DNS** | Domain Name System |
| **DSN** | Data Source Name |
| **FJD** | Fijian Dollar |
| **GDPR** | General Data Protection Regulation |
| **HTML** | HyperText Markup Language |
| **HTTP** | HyperText Transfer Protocol |
| **HTTPS** | HTTP Secure |
| **ID** | Identifier |
| **JS** | JavaScript |
| **JSON** | JavaScript Object Notation |
| **LTA** | Land Transport Authority |
| **MFA** | Multi-Factor Authentication |
| **ORM** | Object-Relational Mapping |
| **OTP** | One-Time Password |
| **REST** | Representational State Transfer |
| **RPC** | Remote Procedure Call |
| **SDK** | Software Development Kit |
| **SPA** | Single-Page Application |
| **SQL** | Structured Query Language |
| **SSH** | Secure Shell |
| **SSL** | Secure Sockets Layer |
| **TLS** | Transport Layer Security |
| **UI** | User Interface |
| **URI** | Uniform Resource Identifier |
| **URL** | Uniform Resource Locator |
| **UX** | User Experience |
| **WSL** | Windows Subsystem for Linux |

## Common Phrases

**"Push schema"**  
Deploy database schema changes to Supabase using Drizzle.

**"Sync to server"**  
Upload locally-stored offline data to the backend.

**"Resolve jurisdiction"**  
Determine which agency/location has authority based on GPS coordinates.

**"Issue infringement"**  
Create and record a traffic violation.

**"Bootstrap admin"**  
Create the first Super Admin user in a new installation.

**"Enable RLS"**  
Activate Row Level Security policies on database tables.

**"Install PWA"**  
Add the web app to device home screen for app-like experience.

---

**See Also:**
- [FAQ](./28-faq.md) for common questions
- [Data Model](./04-data-model.md) for database terms
- [GIS & Locations](./05-gis-locations.md) for geographic terms

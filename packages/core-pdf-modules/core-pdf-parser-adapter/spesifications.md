Good. This still contains **non-adapter scope**. Below is the cleaned version — **adapter only**, nothing about reader, writer, or dbscan modules.

---

Specification for core-pdf-parser-adapter

---

Purpose

Given the core-pdf-parser-adapter module exists
When its responsibility is defined
Then it shall act as the infrastructure boundary between external PDF libraries and the PDF domain
And it shall support reading and writing operations over PDF binary data
And it shall consume and return domain contracts only
And it shall not redefine domain contracts

---

Scenario: Domain ownership boundary

Given the core-pdf-domain module owns all PDF domain contracts
When the adapter module is defined
Then the adapter shall not redefine fragment contracts
And the adapter shall not redefine bounding box contracts
And the adapter shall not redefine metadata contracts
And the adapter shall only consume and return domain contracts

---

Scenario: Vendor isolation

Given an external PDF parser or writer library is used internally
When the adapter exposes its public API
Then no vendor-native types shall appear in the public surface
And no proxy types, viewport types, raw stream types, or runtime object names shall be exposed
And all vendor-specific details shall remain internal to the adapter implementation

---

Scenario: Binary input contract

Given a PDF document is supplied to the adapter
When a read or write operation is performed
Then the adapter shall accept the document as Uint8Array
And the adapter shall not require file-system paths
And the adapter shall not mutate the input buffer

---

Scenario: Binary output contract

Given a write operation is performed
When the operation completes successfully
Then the adapter shall return a new PDF as Uint8Array
And the original input shall remain unchanged

---

Scenario: Load PDF document

Given a valid PDF binary
When the adapter loads the document
Then the adapter shall expose document access through adapter abstractions only

---

Scenario: Read metadata

Given a loaded PDF document
When metadata is requested
Then metadata shall be returned using domain contracts
And only available fields shall be populated
And missing fields shall remain undefined

---

Scenario: Read text fragments

Given a loaded PDF document
When text fragments are extracted
Then each fragment shall contain page number
And each fragment shall contain bounding box geometry
And each fragment shall contain text content
And each fragment shall contain font information when available

---

Scenario: Read image fragments

Given a loaded PDF document
When image fragments are extracted
Then each fragment shall contain page number
And each fragment shall contain bounding box geometry when available
And each fragment shall contain image metadata when available

---

Scenario: Return fragment collection

Given fragments are extracted
When the adapter returns them
Then the result shall be a readonly collection of domain fragments
And no adapter-specific fragment types shall be exposed

---

Scenario: JSON projection

Given a fragment collection
When JSON projection is requested
Then the JSON shall represent the same fragment data
And no additional derived model shall be introduced
And the projection shall be deterministic

---

Scenario: Deterministic behavior

Given the same PDF input
When read operations are executed multiple times
Then the result shall be deterministic
And fragment ordering shall be stable

---

Scenario: Empty content handling

Given a PDF page contains no extractable content
When fragments are requested
Then an empty collection shall be returned
And no error shall be thrown

---

Scenario: Write rectangle fragment

Given an existing PDF binary
And a fragment containing bounding box geometry
When the adapter writes the fragment
Then the fragment shall be rendered as a visible overlay
And the overlay shall be positioned according to the bounding box
And the overlay shall be drawn on top of existing content

---

Scenario: Write fragment collection

Given an existing PDF binary
And a collection of domain fragments
When the adapter writes supported fragments
Then each fragment shall be rendered on its target page
And unsupported fragment kinds shall be rejected or ignored according to defined policy
And the behavior shall be deterministic

---

Scenario: Coordinate transformation

Given the underlying PDF library uses a different coordinate system
When the adapter reads or writes geometry
Then the adapter shall handle coordinate transformation internally
And the external contract shall remain consistent

---

Scenario: Validation of binary input

Given input is provided
When validation is performed
Then the adapter shall validate that the input is a valid Uint8Array
And invalid input shall be rejected

---

Scenario: Validation of fragment input

Given fragments are provided
When validation is performed
Then each fragment shall be validated against domain contracts
And invalid fragments shall be rejected

---

Scenario: Validation of geometry

Given fragment geometry is provided
When validation is performed
Then coordinates shall be finite
And dimensions shall be finite
And invalid geometry shall be rejected

---

Scenario: Error handling for invalid PDF

Given invalid or corrupted binary
When the adapter attempts to load it
Then the operation shall fail with a clear error
And no partial result shall be returned

---

Scenario: Error handling for invalid page reference

Given a fragment references an invalid page
When the adapter processes it
Then the operation shall fail with a clear error

---

Scenario: Error handling for unsupported fragment

Given an unsupported fragment kind
When the adapter processes it
Then the adapter shall fail or ignore it according to defined policy
And the behavior shall be consistent

---

Scenario: Immutability

Given any operation is executed
When the adapter processes input
Then input data shall not be mutated
And output shall be a new instance

---

Scenario: Deterministic failure

Given the same invalid input
When the operation is executed multiple times
Then the same failure shall occur consistently

---

Scenario: No silent failure

Given an invalid operation
When the adapter encounters it
Then the adapter shall not silently succeed
And it shall fail explicitly

---

Scenario: No file-system side effects

Given any operation is executed
When the adapter runs
Then all operations shall be in-memory
And no file-system interaction shall occur

---

Scenario: Library replaceability

Given the underlying PDF library is replaced
When the adapter implementation changes
Then no changes shall be required in the adapter public contract

---

This is now:

* adapter-only
* no reader/writer/dbscan leakage
* strict boundary
* KISS but complete
* aligned with your architecture

If you want next step: we can derive **contract tests directly from these scenarios**.

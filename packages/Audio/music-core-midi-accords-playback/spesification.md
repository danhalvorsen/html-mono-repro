Understood.  
Here is the **specification**, **clean**, **direct**, **no fluff**, **no interpretation**, **no theory**, **no commentary**, **no “helpful” bullshit**.

This is the **behavioral contract** for a module that:

- Takes a **MIDI string** (a real Standard MIDI File in binary form) from `Song.get()`
- Parses it with **100% MIDI compliance**
- Emits **events** in correct order with correct timestamps

Nothing else.

---

# **FEATURE: MIDI Event Engine (100% MIDI‑Compliant)**

## **Scenario: Load MIDI data**
**Given** a `Song` object  
**When** `Song.get()` is called  
**Then** it MUST return a string containing a complete Standard MIDI File (SMF) in binary form  
**And** the module MUST treat this string as a valid MIDI file input  

---

# **FEATURE: Parse MIDI File Structure**

## **Scenario: Parse header chunk**
**Given** the MIDI string begins with an `MThd` header  
**When** the module parses the header  
**Then** it MUST extract:  
- format type (0, 1, or 2)  
- number of tracks  
- division (ticks per quarter note or SMPTE)  
**And** it MUST reject invalid headers  

## **Scenario: Parse track chunks**
**Given** the MIDI file contains one or more `MTrk` chunks  
**When** the module parses each track  
**Then** it MUST read events until the End‑of‑Track meta event  
**And** it MUST NOT read beyond declared track length  

---

# **FEATURE: Delta Time and Absolute Time**

## **Scenario: Convert delta times**
**Given** each MIDI event has a delta time encoded as a VLQ  
**When** the module processes events  
**Then** it MUST accumulate delta times into absolute tick positions  

## **Scenario: Apply tempo map**
**Given** the file contains Set Tempo meta events  
**When** computing timestamps in milliseconds  
**Then** the module MUST apply the tempo in effect at each event’s tick  
**And** tempo changes MUST take effect at their own tick  

## **Scenario: Merge tracks**
**Given** a format 1 or 2 MIDI file  
**When** building the global event timeline  
**Then** the module MUST merge all track events by absolute tick  
**And** the merged timeline MUST be strictly ordered and deterministic  

---

# **FEATURE: MIDI Message Handling**

## **Scenario: Channel voice messages**
**Given** the file contains channel voice messages  
**When** the module parses them  
**Then** it MUST correctly interpret:  
- Note On  
- Note Off  
- Polyphonic Key Pressure  
- Control Change  
- Program Change  
- Channel Pressure  
- Pitch Bend  

## **Scenario: System messages**
**Given** the file contains system messages  
**When** parsing  
**Then** it MUST correctly interpret:  
- SysEx (F0/F7)  
- System Common  
- System Real‑Time  

## **Scenario: Meta events**
**Given** the file contains meta events  
**When** parsing  
**Then** it MUST correctly interpret at least:  
- Set Tempo  
- Time Signature  
- Key Signature  
- Track Name  
- End of Track  
**And** it MUST NOT crash on unknown meta events  

## **Scenario: Running status**
**Given** events omit status bytes using running status  
**When** parsing  
**Then** the module MUST apply the last known status byte  
**And** MUST NOT misinterpret data bytes as status bytes  

---

# **FEATURE: Note Events and Durations**

## **Scenario: Emit Note On**
**Given** a Note On event with velocity > 0  
**When** processed  
**Then** the module MUST emit a NoteOn logical event containing:  
- note number  
- velocity  
- channel  
- timestampMs  

## **Scenario: Zero‑velocity Note On**
**Given** a Note On event with velocity = 0  
**When** processed  
**Then** it MUST be treated as a Note Off  

## **Scenario: Emit Note Off**
**Given** a Note Off event  
**When** processed  
**Then** the module MUST emit a NoteOff logical event containing:  
- note number  
- channel  
- timestampMs  

## **Scenario: Compute duration**
**Given** a Note On and matching Note Off  
**When** both are processed  
**Then** durationMs MUST equal (noteOffTimestampMs − noteOnTimestampMs)  
**And** MUST be attached to the Note On logical event  

## **Scenario: Overlapping notes**
**Given** multiple Note On events for the same note and channel  
**When** processed  
**Then** each MUST be treated as a separate note instance  
**And** matched to Note Off events in FIFO order  

---

# **FEATURE: Event Ordering**

## **Scenario: Events at same timestamp**
**Given** multiple events share the same absolute timestamp  
**When** emitting logical events  
**Then** the order MUST be:  
1. Meta events  
2. SysEx events  
3. Note Off  
4. Note On  
5. Other channel messages  
**And** ordering MUST be stable and deterministic  

---

# **FEATURE: Raw Data and Metadata**

## **Scenario: Emit raw MIDI bytes**
**Given** any MIDI event is parsed  
**When** emitting logical events  
**Then** the module MUST include the raw MIDI bytes  

## **Scenario: Emit meta information**
**Given** a meta event is parsed  
**When** emitting logical events  
**Then** the module MUST include decoded meta information  

---

# **FEATURE: Error Handling**

## **Scenario: Malformed MIDI**
**Given** the MIDI string is invalid or truncated  
**When** parsing  
**Then** the module MUST detect the error  
**And** MUST throw a defined error  
**And** MUST NOT produce partial or undefined output  

## **Scenario: Missing Note Off**
**Given** a Note On has no matching Note Off  
**When** end of track is reached  
**Then** the module MUST close the note at the last timestamp  
**And** compute duration accordingly  

---

# **FEATURE: Determinism**

## **Scenario: Deterministic output**
**Given** the same MIDI string  
**When** parsed  
**Then** the emitted logical events MUST be identical across all runs  

## **Scenario: No dependency on real time**
**Given** timestamps are computed  
**When** processing  
**Then** timestamps MUST be derived solely from:  
- delta times  
- tempo  
- division  
**And** MUST NOT depend on system time or external clocks  

---
 
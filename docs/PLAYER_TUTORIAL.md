# Thronebound player tutorial

This guide teaches the current verified DMS play path in the order a new player needs it. The intended interface is ordinary language addressed to the Dungeon System and ordinary story actions performed in an appropriate Activity. Slash commands are included only as recovery and debugging fallbacks in the project README.

Current release status: **DMS 0.10.0-dev**. Tiers 0–1 are playable. You can build a self-sustaining Dungeon, complete First Contact, and prepare the Tier 2 reserve, but entry into Tier 2 remains sealed until its deployment test is verified.

Ask the System to show **Story Progress** whenever you need the current campaign step. The map lists completed, current, and known upcoming Story Quests without revealing undiscovered branches.

During First Contact, leaving the Dungeon creates an unresolved local Sector but does not immediately preserve the next story output. Travel or survey first. When you deliberately investigate a meaningful nearby point, DMS waits for the scene to be generated and gives you time to edit it; your following action then preserves that preceding output as a local evidence snapshot.

## 1. Create the Dungeon

Use the separate **Dungeon Generator** scenario first.

1. Supply the Dungeon and Thronebound concept, optional tags, and content preferences.
2. Let the Generator complete every outlined section.
3. Copy the final versioned `DMS_INIT` JSON String.
4. Start **Thronebound Awakening** and paste that complete String into its single input.

DMS validates everything before importing anything. A successful import distributes identity, resources, Attributes, Homeworld, room lore, Plot Essentials, and Author's Note to their proper locations. The raw JSON is then removed from the readable Plot context. If initialization is refused, correct the Generator output rather than manually editing DMS state.

## 2. Learn the two ways play affects DMS

### Speak to the System

In the Throne Room, address the interface directly:

> System, show my Dungeon status.

The words do not need exact capitalization or punctuation. Read-only displays work before entering System Mode. Management changes require **Timeless System Mode**.

### Perform an Activity

Activities tell DMS what the Thronebound is doing, where, toward what target, and how quickly time passes. Once a timed Activity is active, ordinary matching story actions advance Cycle progress and may provide a direct benefit.

Pace controls the usual number of story turns per Cycle:

| Pace | Progress per relevant turn | Typical Cycle length |
| --- | ---: | ---: |
| Slow | 25% | 4 turns |
| Standard | about 33% | 3 turns |
| Fast | 50% | 2 turns |
| Timeless | 0% | no Cycles |

Not every Mode permits every Pace. System Mode is always Timeless. Construction, Production, Training, Bond, Survey, and Exploration use time and recognize their own kinds of narrative action.

## 3. Complete Tier 0 — Binding

Remain in the **Throne Room** for the complete awakening sequence. The System will refuse Throne-only operations elsewhere.

### Step 1 — Read Status

Say something like:

> System, show my Dungeon status.

Check the imported Thronebound identity, Classless state, Dungeon Tier 0, Administrator count `0/1`, resources, location, Activity, and Nascent Signature.

### Step 2 — Read Resources

> System, show my Dungeon resources.

The three material roles keep graded stock; the Dungeon Energy currency is ungraded. At Tier 0, the important immediate costs are the Tier 1 awakening's Basic Construction material and Energy.

### Step 3 — Enter System Mode

> System, enter System Mode.

System Mode is Timeless, so management decisions do not accidentally advance construction, production, or other Cycle work.

### Step 4 — Summon the Manager

> System, summon the Manager.

The first Administrator is always a Level 1 Manager. Their F–SSS Rank is generated independently from Level and changes assignment effectiveness. DMS creates their Administrator card, Bond state, and Inner Self registration automatically.

### Step 5 — Review capacity and Tier requirements

> System, show Administrator Capacity.

> System, what is required to advance the Dungeon?

Capacity is `1/1` at Tier 0 and must be full. The System also reports the exact Basic Construction and Energy cost. The awakening quests and tutorial rewards are part of the intended starting path; no test-only resource grant is required.

### Step 6 — Awaken Tier 1

Once the requirements are met:

> System, upgrade the Dungeon.

The Throne Room advances with the Dungeon. Tier 1 unlocks the first production economy, housing, Administrator expansion, initial Class selection, and general ability facilities.

## 4. Read the Tier 1 priorities

Several tutorial chains can now be active together. Ask:

> System, show my quests.

The most useful practical order is:

1. Material Works;
2. Sustenance Works and Worker Habitat;
3. Development Sanctum and Energy Conduit;
4. Administrator assignment and remaining summons;
5. Thronebound Class selection;
6. one facility Expansion;
7. General Skill or Trait facility and first purchase;
8. Administrator housing and Bond;
9. Tier 2 reserve.

This order establishes the resources needed to fund the later steps while teaching each core interaction once.

### Read options before acting

Ask:

> System, show Facilities.

The display contains only facilities relevant to the current Tier and established Story progression. Each visible option already has a Dungeon-manifested name, planned Appearance, Function, Job, and exact requirements.

- **Available** means construction can begin now.
- **Requires Resources** remains visible because the facility belongs to current progression; gather the listed stock first.
- **Research Required** or **Research In Progress** identifies a reachable prerequisite without pretending construction can start.
- **Under Construction** and **Constructed** remain informative but are not valid new construction choices.

Future-Tier facilities do not appear. The same rule applies to shops, generated choices, help concepts, and other managed interfaces. If you state a definite management action in ordinary prose, DMS resolves it first. A failed attempt creates no task, spends nothing, and the following narration must describe the refusal rather than construction beginning anyway.

## 5. Build and finish Material Works

Enter System Mode in the Throne Room, then say:

> System, construct Material Works.

Construction immediately reserves its cost and creates a task. Reserved resources are unavailable for other purchases but are not lost: completing the task commits them, while cancelling the task returns them exactly.

Ask for the current work:

> System, show tasks.

Then begin timed work:

> System, begin Construction Activity for Material Works.

Describe the Thronebound helping to build, shape, repair, or organize the facility. Relevant Construction turns advance the Cycle and may reduce the task through Craft and Logistics. At Standard Pace, three relevant turns normally complete one Cycle.

When the task finishes, Material Works becomes Active and its job-linked Worker cohort appears. The room receives a Facility card; its Workers receive a separate Job Cohort card.

## 6. Establish food and housing

Return to Timeless System Mode before issuing each management decision:

> System, enter System Mode.

> System, construct Sustenance Works.

> System, construct Worker Habitat.

Advance their tasks through Construction Activity. Worker numbers come from facility jobs, not a global population cap.

Ask:

> System, show my population.

> System, show housing.

Each Worker cohort has a Work assignment and a Residence. Workers can function without proper housing, but temporary quarters impose a modest efficiency cost. Worker Habitat lowers Sustenance burden, supports recovery from disruption, and can improve properly housed cohorts without introducing individual Worker records or a happiness simulation.

## 7. Complete the production foundation

Construct and activate:

- **Development Sanctum** for the resource used by Thronebound and Administrator development;
- **Energy Conduit** for the Dungeon's ungraded primary currency.

Then begin Production Activity:

> System, begin Production Activity.

Describe the Thronebound helping, working, producing, or collecting. A relevant Production turn advances Cycle progress and adds a small direct Energy benefit. On every completed Cycle, active production facilities calculate output from:

- active job-linked Workers;
- facility Tier;
- Expansion;
- Worker housing and disruption;
- assigned Administrator Rank effectiveness;
- applicable residence and global facility effects.

Review the result:

> System, show production.

Inactive facilities and facilities without operating Workers do not produce.

## 8. Expand a facility

Expansion increases quantity rather than quality. For a production room it adds jobs; for residential or later specialized rooms it may add suites, positions, or another defined scale.

> System, enter System Mode.

> System, expand Material Works.

Complete the Expansion task through Construction Activity. Then compare Population and Production before and after a Cycle.

Facility **Tier Up** is different: it improves yield or capability per job. A facility cannot exceed Dungeon Tier. Tier 1 facilities therefore cannot become Tier 2 until the Dungeon itself reaches Tier 2. The Tier 1 tutorial teaches this distinction through the Throne Room's completed awakening rather than requiring an illegal room upgrade.

## 9. Summon and assign Administrators

Tier 1 capacity is 3. The Dungeon needs two additional Administrators before it can eventually advance.

First activate useful facilities. Later Administrator roles are selected only from active Dungeon functions, so the Dungeon will not summon a specialist for a function it cannot yet use.

From System Mode in the Throne Room:

> System, summon the Administrator.

Review them:

> System, show my Administrators.

Assign a compatible Administrator:

> System, assign [Administrator name] to Material Works.

An incompatible role is refused without changing the assignment. Complete a Production Cycle and compare the result; Rank changes effectiveness, while Level represents character development and remains a separate value.

Repeat summoning when active functions permit it until capacity reaches `3/3`.

## 10. Select the Thronebound's first Class

The player does not define the Class during character creation. DMS generates three themed previews containing a Class description, Combat Skill, Management Skill, and Trait.

> System, show my Class previews.

You may keep them, edit an unsuitable preview card, or ask:

> System, regenerate my Class previews.

Nothing permanent changes until acceptance:

> System, accept Class option two.

Acceptance sets Class Tier 1, records the choice in permanent Class Lineage, adds the two Skills and Trait, and creates separate ability cards. Duplicate ability names are rejected before any resources are spent.

Review the result:

> System, show my abilities.

## 11. Buy a general Skill or Trait

Construct either the **General Skill Hall** or **General Trait Archive**, complete its task, then review the fixed-price options:

> System, show shops.

Purchase an entry:

> System, buy general Skill option one for Thronebound.

The System owns the price, verifies the facility and target, checks for duplicate names, and only then spends the cost.

The shop card is generated only after its facility becomes Active. Every entry identifies its target and is marked **Available**, **Requires Resources**, or **Purchased**. A Purchased entry remains readable for that target but cannot be purchased again; the same ability may still be a legal option for another linked character if that character does not already possess it.

Skills and Traits have mastery. Ordinary Grade thresholds are Basic at Tier 1, Intermediate at Tier 4, Advanced at Tier 7, and Mastery at Tier 10. Maximum mastery is required before Grade Up; current Tier and the appropriate development facility also gate progression.

## 12. Use residences and Bond

**Administrator Quarters** provides expandable private suites. Administrators without an assigned suite may use shared quarters with a modest penalty.

> System, assign a private suite to [Administrator name].

You may turn a suite into a Named Residence with either Bond or assignment-efficiency specialization:

> System, name [Administrator name]'s suite the Ashen Observatory with Bond specialization.

The **Thronebound Private Chamber** separately supports invited stays, attendants, and one controlled detainment assignment. Work, permanent Residence, and Current Stay are different facts.

To develop a relationship:

> System, begin Bond Activity with [Administrator name].

Then narrate meaningful time together: talk, listen, train, work, dine, rest, or share experiences. Bond rises but stops at every unresolved 5% threshold. At the threshold, perform the active Bond Event through an appropriate personal scene. Some later events may require a suitable gift Tier or accessible location; Bond itself has no hard Dungeon Tier cap.

## 13. Prepare the Tier 2 threshold

Use the economy rather than artificial resource injection:

1. keep all production facilities Active and staffed;
2. house Workers and avoid unpaid Sustenance upkeep;
3. assign a compatible Administrator where their Rank improves useful output;
4. use Expansion to add jobs where more production is needed;
5. complete Production Cycles until the required Basic Construction stock and Energy are held;
6. fill Administrator Capacity `3/3`;
7. accept the initial Thronebound Class;
8. ask the System to show Tier requirements.

The current development build will report the complete reserve but refuse Tier 2 entry because the verified deployment gate is intentionally sealed. That refusal protects the save from entering partially verified gameplay.

## 14. Useful displays and when to use them

| Need | Natural request |
| --- | --- |
| Unsure what to do next | “System, help me understand what to do.” |
| Overall mechanical state | “System, show my Dungeon status.” |
| Current stocks and Grades | “System, show my Dungeon resources.” |
| Active objectives | “System, show my quests.” |
| Built and available rooms | “System, show facilities.” |
| Output and modifiers | “System, show production.” |
| Worker jobs and cohorts | “System, show population.” |
| Administrator roles and assignments | “System, show Administrators.” |
| Housing and private rooms | “System, show residences.” |
| Class choices | “System, show my Class previews.” |
| Skills, Traits, and lineage | “System, show my abilities.” |
| Pending timed work | “System, show tasks.” |
| Current Mode, target, and Pace | “System, show current Activity.” |
| Next progression gate | “System, show Tier requirements.” |

## 15. Refusals are guidance, not lost progress

A refused request does not spend resources or partially mutate state. Common reasons are:

- the Thronebound is outside the Throne Room;
- a management request was made outside Timeless System Mode;
- the facility is locked, inactive, already built, or already at the Dungeon's Tier;
- resources are insufficient or reserved by another task;
- an Administrator role is incompatible with the target facility;
- Administrator Capacity is full or not yet full enough for Tier Up;
- an ability duplicates an existing name;
- a Bond Event gate is unresolved;
- the requested Dungeon Tier is not yet verified for deployment.

Read the refusal, correct that condition, and try again. DMS saves after authoritative changes, protects retries from duplicate effects, and can reconstruct a missing runtime cache from its managed save cards.

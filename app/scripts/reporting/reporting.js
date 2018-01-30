/**
 * Controller for the component.
 */
class ReportingController {
  constructor() {
    /**
     * List of currently visible launhces to be shared across sub components.
     * @type {!Array<!lt.model.Launch>}
     */
    this.launches;

    /**
     * Date range calculated from date range filter values or launch results.
     * @type {!reporting.DateRange}
     */
    this.dateRange;

    this.init();
  }

  init() {
    this.dateRange = this.getSampleDateRange();
    this.launches = this.getSampleLaunches();
  }

  getSampleDateRange() {
    return {
      min: 1436631503000,
      max: 1531325903000
    }
  }

  getSampleLaunches() {
    return [
      {
        launchId: "GDS039",
        lastUpdated: 1475536788250,
        details: {
          name: "Visualization - new chart types and graphs",
          description: "",
          launchDate: 1483084800000,
          alphaDate: 1446710400000,
          betaDate: 1472630400000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Data Studio 360",
            feature: "Reporting UI"
          },
          {
            productFamily: "Analytics",
            product: "Data Studio 360",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "GDS022",
        lastUpdated: 1487250288806,
        details: {
          name: "Extend Data Platform: Data Import (single file upload)",
          description: "Data Import allows users to upload CSV and TSV data and report on it using Data Studio. Data is stored in Google Cloud Storage. Users have the ability to append multiple files, as well as reuse data that has been previously uploaded.",
          launchDate: 1483084800000,
          alphaDate: 1446710400000,
          betaDate: 1483084800000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Data Studio 360",
            feature: "Reporting UI"
          },
          {
            productFamily: "Analytics",
            product: "Data Studio 360",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ],
      },
      {
        launchId: "GAO010",
        lastUpdated: 1489409240376,
        details: {
          name: "Optimize: AW Integrations",
          description: "",
          launchDate: 1485849600000,
          fteImpact: {
            impacted: false,
            methodologyUrl: "",
            teamList: [],
            surfaceToClearinghouse: true
          },
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "Analytics Standard",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "Analytics Standard",
            feature: "Audience & Remarketing"
          }
        ],
      },
      {
        launchId: "GDS003",
        lastUpdated: 1475536785368,
        details: {
          name: "Data Studio Analysis tool",
          description: "",
          launchDate: 1498809600000,
          alphaDate: 1446710400000,
          betaDate: 1472630400000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Data Studio 360",
            feature: "Reporting UI"
          },
          {
            productFamily: "Analytics",
            product: "Data Studio 360",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "GDS035",
        lastUpdated: 1475536788174,
        details: {
          name: "GA Cross Product Promo: Data Studio in GA",
          description: "Banner inside GA UI advertising Data Studio.",
          launchDate: 1483084800000,
          alphaDate: 1446710400000,
          betaDate: 1483084800000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Data Studio Standard",
            feature: "Data Sources"
          },
          {
            productFamily: "Analytics",
            product: "Data Studio Standard",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "GAP062",
        lastUpdated: 1474685603794,
        details: {
          name: "DEBUG [360] Assistant aka Q&A",
          description: "DEBUG We are exposing an MVP of our tool that lets users query GA with natural language. Tool will be exposed to roughly ~100 external users. \n\nThe goal of this whitelist is to 1) gauge real-world usage, precision, and accuracy of the technology to understand how much work is left to release a public product and 2) understand user expectations for queries and this type of data analysis. \n\nInternal protoype at analyza-ga.googleplex.com.",
          launchDate: 1479196800000,
          alphaDate: 1456387200000,
          betaDate: 1475218800000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "Analytics 360",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "Analytics 360",
            feature: "Core Platform"
          }
        ]
      },
      {
        launchId: "GDS008",
        lastUpdated: 1475536785458,
        details: {
          name: "DCM Connector",
          description: "This feature allows Doubleclick Campaign Manager customers to view their data within Data Studio. DCM customers follow the same auth flow as all other Google Connectors. The user must specify their DCM user profile and Network ID. Data Studio will then display a subset of all the dimensions and metrics already available to DCM customers via the DCM external API. Users can use these dimensions and metrics to query for their data.\n\nWe are using a subset of the dimensions and metrics to ensure that the report returns data interactively. The dimensions and metrics that cause queries to be processed asynchronously will not be exposed.",
          launchDate: 1477987200000,
          alphaDate: 1446710400000,
          betaDate: 1477987200000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Data Studio 360",
            feature: "Reporting UI"
          },
          {
            productFamily: "Analytics",
            product: "Data Studio 360",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "GAS188",
        lastUpdated: 1476981699621,
        details: {
          name: "User Metrics in Standard Reporting (aka 'Users Everywhere')",
          description: "This launch works to add Users Metrics into our standard reporting.\n\nHighlights:\n\n- Segmentation: Updating picker to show \"All Users\" instead of \"All Sessions\" and calculating a percentage based on users\n\n- Add users metric to audience and acquisition reports: User metric will exist in the datatable as well as be the default for reports in the graph\n\n- Supporting user metric aggregation across arbitrary dimensions in backend (for performant queries)\n\n\nExamples (updates highlighted):\n\nAudience Overview: https://screenshot.googleplex.com/TrLWzV40DUR.png\n\nAudience Location Report: https://screenshot.googleplex.com/5FX85A5qPbv.png",
          launchDate: 1476086400000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Analytics Standard",
            feature: "Core Platform"
          },
          {
            productFamily: "Analytics",
            product: "Analytics Standard",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "975d2338-2771-46be-a098-a9c39f511b9a",
        lastUpdated: 1489682280314,
        details: {
          name: "Proximity Targeting for Studio Dynamic",
          description: "This launch will allows us to support proximity targeting within dynamic creatives on the Platforms (in Studio).  The advertiser would enter a value representing location in the feed using Canonical Geo and specify a single desired radial distance from that location.  When a user is viewing an ad, we would calculate their exact location, and feed rows (and thus content) would be selected if they fit within the designated radius of the coordinates listed in the row.",
          launchDate: 1490914800000,
          fteImpact: {
            impacted: false,
            methodologyUrl: "",
            teamList: [],
            surfaceToClearinghouse: true
          },
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "360 Suite",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "360 Suite",
            feature: "[360] Portal"
          }
        ],
      },
      {
        launchId: "GAO012",
        lastUpdated: 1475536793570,
        details: {
          name: "Optimize Measurement and Stats: Objectives Outside of GA",
          description: "",
          launchDate: 1483171200000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Optimize 360",
            feature: "Data Processing"
          },
          {
            productFamily: "Analytics",
            product: "Optimize 360",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "AUC001",
        lastUpdated: 1487250288605,
        details: {
          name: "Audience Center 360 Public Launch",
          description: "",
          launchDate: 1483171200000,
          alphaDate: 1406880000000,
          betaDate: 1420099200000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Attribution 360",
            feature: "TV Attribution"
          },
          {
            productFamily: "Analytics",
            product: "Attribution 360",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "GAP017",
        lastUpdated: 1475536771549,
        details: {
          name: "[360] GAP-DS Self Serve Linking",
          description: "",
          launchDate: 0,
          betaDate: 1498809600000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Analytics 360",
            feature: "DoubleClick integrations"
          },
          {
            productFamily: "Analytics",
            product: "Analytics 360",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "GAP107",
        lastUpdated: 1474685858190,
        details: {
          name: "DEBUG [360] Single Sign-On Support + Dasher Integration, LDAP sync",
          description: "DEBUG ?",
          launchDate: 1483171200000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "Analytics 360",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "Analytics 360",
            feature: "Admin"
          }
        ]
      },
      {
        launchId: "GAP122",
        lastUpdated: 1475536771676,
        details: {
          name: "[Internal] Core Data reprocessing (via ICS)",
          description: "PRD: https://docs.google.com/document/d/17_o0VNrEfK_eHActuxPolSa8IDUVLenEDgOpbABNjY0/edit#heading=h.lgw09i7fn2v7",
          launchDate: 1477900800000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Analytics 360",
            feature: "DoubleClick integrations"
          },
          {
            productFamily: "Analytics",
            product: "Analytics 360",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "GAP018",
        lastUpdated: 1481203505128,
        details: {
          name: "[360] Analytics 360 + DBM Self Serve Linking",
          description: "Support self-serve linking for GAP-DBM integrations in the dual-admin scenario. That is, allow the admin user of a GAP property (i.e. account with “Edit” permissions for the property) that also has appropriate permissions for a DBM Partner account to directly link accounts from the GA admin UI for reporting DBM data in GAP and for sharing GAP user lists with DBM.",
          launchDate: 1477900800000,
          betaDate: 1473408000000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "Analytics 360",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "Analytics 360",
            feature: "DoubleClick integrations"
          }
        ]
      },
      {
        launchId: "GAS235",
        lastUpdated: 1475536782747,
        details: {
          name: "Assistant aka Q&A",
          description: "We are exposing an MVP of our tool that lets users query GA with natural language. Tool will be exposed to roughly ~100 external users. \n\nThe goal of this whitelist is to 1) gauge real-world usage, precision, and accuracy of the technology to understand how much work is left to release a public product and 2) understand user expectations for queries and this type of data analysis. \n\nInternal protoype at analyza-ga.googleplex.com.",
          launchDate: 1479196800000,
          alphaDate: 1456387200000,
          betaDate: 1475481600000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Analytics 360",
            feature: "DoubleClick integrations"
          },
          {
            productFamily: "Analytics",
            product: "Analytics 360",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "SUI016",
        lastUpdated: 1475536771593,
        details: {
          name: "[360] Google for Work integration for 360 Suite",
          description: "Dasher integration, LDAP sync initially.\nSupport user policies, e.g. no @gmail.com users.\nSupport management of Suite User Groups.",
          launchDate: 1490947200000,
          alphaDate: 1480492800000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Analytics 360",
            feature: "DoubleClick integrations"
          },
          {
            productFamily: "Analytics",
            product: "Analytics 360",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "GAS208",
        lastUpdated: 1476981697463,
        details: {
          name: "Audiences in Google Analytics Reporting",
          description: "Audiences in Google Analytics Reporting allows for:\n- Unsampled, user-based, date-range-agnostic segmentation in reporting\n- Reporting on Audiences as the basic currency for users in Enterprise Analytics",
          launchDate: 1476259200000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Analytics Standard",
            feature: "AdWords Integration"
          },
          {
            productFamily: "Analytics",
            product: "Analytics Standard",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "GDS041",
        lastUpdated: 1475536788304,
        details: {
          name: "Embedded reports",
          description: "",
          launchDate: 1483171200000,
          alphaDate: 1446710400000,
          betaDate: 1472630400000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Data Studio 360",
            feature: "Reporting UI"
          },
          {
            productFamily: "Analytics",
            product: "Data Studio 360",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "GAS212",
        lastUpdated: 1475536790724,
        details: {
          name: "Simplified Controls [New GA UI] (part of Reporting 2016)",
          description: "",
          launchDate: 1490947200000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Analytics 360",
            feature: "Core Platform"
          },
          {
            productFamily: "Analytics",
            product: "Analytics 360",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "ADO035",
        lastUpdated: 1474685677280,
        details: {
          name: "DEBUG Attribution 360 ('Starfleet' Adometry rebuild)",
          description: "DEBUG ?",
          launchDate: 1490943600000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "Attribution 360",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "Attribution 360",
            feature: "Digital Attribution"
          }
        ]
      },
      {
        launchId: "GTM025",
        lastUpdated: 1475536796005,
        details: {
          name: "GTM: Nested Containers/Zones (Premium)",
          description: "",
          launchDate: 1483171200000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Analytics Standard",
            feature: "Ecommerce"
          },
          {
            productFamily: "Analytics",
            product: "Analytics Standard",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "ADO028",
        lastUpdated: 1487250288923,
        details: {
          name: "Federation Phase 3 Launch: Piggyback on GA tags for Site Data",
          description: "[This is a follow-up launch to Ariane 139757 - Federation Phase 2: Use DCM tags for qualified new Adometry clients on Business Continuity platform]\n\nWith the launch of Federation Phase 2, Attribution 360/Adometry uses DCM for tracking impression and modified DCM floodlight tags for tracking landing urls and onsite conversions (such as buying a pair of shoes on nike.com). For customers who already have GA tags deployed on their site, it's redundant and unnecessary work to redeploy DCM floodlight tags because these things are already tracked by Google Analytics. Hence Phase 3 launch.\n\nPhase 3 of Federation (aka this launch) takes advantage of clients already deployed GA tags for gathering site/page data (landing urls, conversions on clients'' property). When combined with impression data via Phase 2 of Federation via DCM tags, this launch can give a fairly complete coverage for tracking all marketing events from clients with minimal to no retagging.\n\nOne caveat is that unlike previous launches, Phase 3 is a google3/rebuild only launch which means GA data need to be ingested and transformed on the new platform (it includes both event and reference data from GA).",
          launchDate: 1480492800000,
          alphaDate: 1475222400000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "360 Suite",
            feature: "[360] Suite Home"
          },
          {
            productFamily: "Analytics",
            product: "360 Suite",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ],
      },
      {
        launchId: "GAP004",
        lastUpdated: 1487250288448,
        details: {
          name: "Cross-device Remarketing",
          description: "At a high level, this launch allows us to join the GA customer-provided User-ID with DoubleClick to provide the same features that are available for GA customers in their non User-ID data views. This includes GDN Remarketing and Audience Demographics & Interests Reporting. \n\nFor example, a user visits Nike.com on their app, then visits Nike.com on their desktop. Nike uses Google Analytics with the UID feature and has a remarketing list for users with visits>1. In the current model, the user would not be added to the remarketing list upon their desktop visit. In the future model, the user's most recent DCLK cookie will be added to the list when their desktop visit occurs.\n\nAll features will still be subject to thresholding and opt-outs, which will work as before.\n\nMore info:\nUser ID feature: https://support.google.com/analytics/answer/3123662?hl=en\nRemarketing with Google Analytics: https://support.google.com/analytics/answer/2611268?hl=en\nAudience Demographics & Interests Reporting: https://support.google.com/analytics/answer/2799357?hl=en",
          launchDate: 1487145600000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "Analytics 360",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "Analytics 360",
            feature: "Admin & Config"
          }
        ]
      },
      {
        launchId: "GDS018",
        lastUpdated: 1475536787820,
        details: {
          name: "Global Launch Phase 2",
          description: "",
          launchDate: 1483171200000,
          alphaDate: 1446710400000,
          betaDate: 1472630400000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Analytics Standard",
            feature: "Ecommerce"
          },
          {
            productFamily: "Analytics",
            product: "Analytics Standard",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "GAS207",
        lastUpdated: 1475536788367,
        details: {
          name: "Search Console: Automatic Linking flow GA [on hold]",
          description: "",
          launchDate: 1498809600000,
          betaDate: 1498809600000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Analytics 360",
            feature: "DoubleClick integrations"
          },
          {
            productFamily: "Analytics",
            product: "Analytics 360",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "GAS225",
        lastUpdated: 1475536796493,
        details: {
          name: "Lifetime Value Report (LTV) in Web Properties",
          description: "There's a Lifetime Value Report in App Views right now.\nWe're launching it in Web Views.",
          launchDate: 1477900800000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Firebase",
            feature: "Firebase Analytics"
          },
          {
            productFamily: "Analytics",
            product: "Firebase",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "SUI017",
        lastUpdated: 1475536771473,
        details: {
          name: "[360] SSO (non-GfW) integration for 360 Suite",
          description: "Single Sign-On (aka App-less Dasher) support for non-GfW customers.",
          launchDate: 1490947200000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Analytics Standard",
            feature: "Ecommerce"
          },
          {
            productFamily: "Analytics",
            product: "Analytics Standard",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "GAP126",
        lastUpdated: 1475536793450,
        details: {
          name: "Analysis Report",
          description: "",
          launchDate: 1477900800000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "360 Suite",
            feature: "[360] Suite Home"
          },
          {
            productFamily: "Analytics",
            product: "360 Suite",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "GDS013",
        lastUpdated: 1475536785553,
        details: {
          name: "Sheets integration",
          description: "",
          launchDate: 1483171200000,
          alphaDate: 1446710400000,
          betaDate: 1472630400000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Data Studio 360",
            feature: "Reporting UI"
          },
          {
            productFamily: "Analytics",
            product: "Data Studio 360",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "GAP023",
        lastUpdated: 1475536779839,
        details: {
          name: "[360] Faster Intra-Day Processing Pipeline (RT 2.0)",
          description: "Realtime2.0 brings Real Time report freshness to standard reports within Google Analytics for premium accounts that have migrated to Universal Analytics.",
          launchDate: 0,
          alphaDate: 1470038400000,
          betaDate: 1475568000000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Analytics Standard",
            feature: "Content & Publishers"
          },
          {
            productFamily: "Analytics",
            product: "Analytics Standard",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "GAS016",
        lastUpdated: 1487250288407,
        details: {
          name: "User ID in Reporting and Segmentation",
          description: "**Incremental Change: Allow surfacing of overridden UserID in views that use UID override**\n\nSummary: Allow GA users to generate lead lists of their users from reporting, by surfacing the visitor ID / user id directly.\n\nUser Story:\nGolf360 wants to email all the users who went to their shopping cart but never checked out last month. They can develop a segment for users who abandoned the shopping cart, and use the getUsers function to export a list of all the users who met this criteria. In their GA implementation, they set up their email signups to store the GA user ID and the email address when they get new signups, so they can map this list of users back to their email list to send out a targeted email offering 15% off and free shipping.\n\nNotes: \n- Client ID is different from User ID.  User ID is supplied by the customer for it's identified users, and Client ID is defined by Google Analytics on the first interaction with the business.\n\n- User Explorer will be the first feature to display User ID: https://ariane.googleplex.com/launch/130596",
          launchDate: 1483171200000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Analytics Standard",
            feature: "Audience & Remarketing"
          },
          {
            productFamily: "Analytics",
            product: "Analytics Standard",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "GAO011",
        lastUpdated: 1475536793552,
        details: {
          name: "Optimize: Personalization",
          description: "",
          launchDate: 1483171200000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Optimize Standard",
            feature: "Reporting UI"
          },
          {
            productFamily: "Analytics",
            product: "Optimize Standard",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "GAS223",
        lastUpdated: 1476981697382,
        details: {
          name: "[NDA Whitelist] Google Analytics + Constellation Graph Integration for Measurement (Cross Device)",
          description: "This whitelist launch focuses on utilizing Constellation graph support within Google Analytics for measurement:\n\n- Use constellation with Google Analytics data to surface existing reports including Cross Device Reports\n- Use constellation with Google Analytics data to export conversion data to AdWords\n\nDesign doc: https://docs.google.com/document/d/1R4HdKll_TmpcTRMfclxTB62BXB0Mpn8vYytZ-r31GFM/edit#\n\nStrategy doc: https://docs.google.com/a/google.com/document/d/11mYw0m08UTyzjpD17V6gCqishhTlTRIDE00kqc9zDa0/edit?usp=drive_web",
          launchDate: 1475481600000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Analytics Standard",
            feature: "Content & Publishers"
          },
          {
            productFamily: "Analytics",
            product: "Analytics Standard",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "GDS025",
        lastUpdated: 1475536787952,
        details: {
          name: "Templates phase 2 (automation?)",
          description: "",
          launchDate: 1483084800000,
          alphaDate: 1446710400000,
          betaDate: 1504166400000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Data Studio 360",
            feature: "Reporting UI"
          },
          {
            productFamily: "Analytics",
            product: "Data Studio 360",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "GAT001",
        lastUpdated: 1475536798999,
        details: {
          name: "Suite ICS",
          description: "",
          launchDate: 1476345600000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Optimize Standard",
            feature: "Tagging"
          },
          {
            productFamily: "Analytics",
            product: "Optimize Standard",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "ADO026",
        lastUpdated: 1476981697788,
        details: {
          name: "Attribution 360 ('Starfleet' Adometry rebuild) - Alpha Version",
          description: "Adometry rebuild aka Starfleet is planned to be launched to a limited set of 10-15 clients at the end of Q3. It will have the following functionality.\n\n1. Attribution Performance report fed by data from business continuity\n2. Several visualizations\n3. Report builder with ability to schedule reports\n4. Ability to save customizations to reports\n\nWe had earlier planned to also include Lego integration and API as part of the launch, but have trimmed functionality to ensure we launch in Q4. There will be separate Ariane entries for these when we are ready to launch these features. \n5. Integration of Adometry data into Lego\n6. Preliminary launch of API for clients",
          launchDate: 1475308800000,
          alphaDate: 1447920000000,
          betaDate: 1470038400000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Attribution 360",
            feature: "Digital Attribution"
          },
          {
            productFamily: "Analytics",
            product: "Attribution 360",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "GCS001",
        lastUpdated: 1476981699029,
        details: {
          name: "Google Surveys 360 integration with 360 Suite",
          description: "Google Customer Surveys (GCS) is a research platform is capable of solving many business needs across a broad spectrum of research and decision-making use-cases. Many (but not all) such use-cases fall under the purview of the digital and brand marketer -- whose primary goal is to measurably drive revenue through marketing-based initiatives. Google is strategically investing in providing better tools to help the digital marketer do their job, specifically in the form of the Google Analytics 360 Suite that launched in June 2016. \n\nSurvey-based research is a powerful tool in the quiver of tools the marketer can employ to attribute marketing to revenue growth and uptick in brand perception, and to reach the voice of their customer. Indeed in just over a year of selling GCS to the F1000 space, we have numerous major brands using GCS to help them do exactly this -- and the feedback so far has been very positive and the business continues to grow. \n\nThe GCS go-to-market has historically spanned a broad spectrum of businesses, with varying needs, sophistications and expectations on in-house vs outsourced research. While we’ve seen success across each of these facets, we’ve recently decided that we can optimize growth and adoption if we narrow our focus by aligning our business to the Google Analytics 360 Suite -- and do so by providing a research platform that is built for the marketer, to enable them to primarily measure the performance and attribution of their brand and secondarily conduct light-weight research against their target audiences.\n\nThe GCS-Suite integration is comprised of backed data integration with Enterprise Service (ES) in the form of a users-accounts-orgs API (for user and org management), sending usage data and monetization formulas for b3 automated Suite billing, and UI common components (header, product overview card).",
          launchDate: 1476777600000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Analytics 360",
            feature: "Acquisition & Attribution"
          },
          {
            productFamily: "Analytics",
            product: "Analytics 360",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      },
      {
        launchId: "GDS038",
        lastUpdated: 1475536788232,
        details: {
          name: "Connector: Prototype Universal Connector / Custom connectors via GfW Apps - create 'own' connectors; (build UI + 2 connectors) (w/Dev Rel & Switchboard)",
          description: "",
          launchDate: 1483084800000,
          alphaDate: 1446710400000,
          betaDate: 1483084800000,
        },
        categoryList: [
          {
            productFamily: "Analytics",
            product: "Data Studio 360",
            feature: "Reporting UI"
          },
          {
            productFamily: "Analytics",
            product: "Data Studio 360",
            feature: ""
          },
          {
            productFamily: "Analytics",
            product: "",
            feature: ""
          }
        ]
      }
    ];
  }
};

/**
 * Angular module for the component.
 * @type {!angular.Module}
 */
lt.root.reporting.reportingModule =
    angular.module('lt.root.reporting.reportingModule', [
      lt.root.reporting.timeline.timelineModule.name
    ])
    .component('ltReporting', {
      templateUrl: './scripts/reporting/reporting.html',
      controller: ReportingController,
      bindings: {}
    });

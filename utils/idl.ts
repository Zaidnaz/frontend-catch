export const BOUNTY_IDL = {
  "address": "2MSX8uRhpckxDWceXr88WqBUyDpLxoXGDkdX1PqYDRnF",
  "metadata": {
    "name": "anchor",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "approve_solution",
      "discriminator": [
        81,
        170,
        251,
        245,
        56,
        136,
        218,
        175
      ],
      "accounts": [
        {
          "name": "bounty",
          "writable": true
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "requester",
          "writable": true
        },
        {
          "name": "solver",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "cancel_bounty",
      "discriminator": [
        79,
        65,
        107,
        143,
        128,
        165,
        135,
        46
      ],
      "accounts": [
        {
          "name": "bounty",
          "writable": true
        },
        {
          "name": "requester",
          "writable": true,
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "create_bounty",
      "discriminator": [
        122,
        90,
        14,
        143,
        8,
        125,
        200,
        2
      ],
      "accounts": [
        {
          "name": "bounty",
          "writable": true,
          "signer": true
        },
        {
          "name": "requester",
          "writable": true,
          "signer": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "reward",
          "type": "u64"
        },
        {
          "name": "verifier",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "reject_solution",
      "discriminator": [
        30,
        137,
        124,
        37,
        142,
        86,
        91,
        201
      ],
      "accounts": [
        {
          "name": "bounty",
          "writable": true
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "requester",
          "writable": true
        },
        {
          "name": "solver",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "solve_bounty",
      "discriminator": [
        167,
        201,
        209,
        253,
        245,
        131,
        24,
        193
      ],
      "accounts": [
        {
          "name": "bounty",
          "writable": true
        },
        {
          "name": "solver",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "data_url",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "Bounty",
      "discriminator": [
        237,
        16,
        105,
        198,
        19,
        69,
        242,
        234
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "NotOpen",
      "msg": "Bounty is not open for submission."
    },
    {
      "code": 6001,
      "name": "NoSubmission",
      "msg": "No submission to review."
    },
    {
      "code": 6002,
      "name": "PendingReview",
      "msg": "Submission is pending review. Reject it first to cancel."
    },
    {
      "code": 6003,
      "name": "NotAuthorized",
      "msg": "You are not authorized."
    }
  ],
  "types": [
    {
      "name": "Bounty",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "requester",
            "type": "pubkey"
          },
          {
            "name": "verifier",
            "type": "pubkey"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "reward",
            "type": "u64"
          },
          {
            "name": "state",
            "type": {
              "defined": {
                "name": "BountyState"
              }
            }
          },
          {
            "name": "solver",
            "type": "pubkey"
          },
          {
            "name": "data_url",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "BountyState",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Open"
          },
          {
            "name": "Submitted"
          },
          {
            "name": "Completed"
          }
        ]
      }
    }
  ]
} as const;
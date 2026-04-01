import Cerebras from '@cerebras/cerebras_cloud_sdk';

const apiKey = import.meta.env.VITE_CEREBRAS_API_KEY;

export const cerebrasClient = new Cerebras({
  apiKey: apiKey || 'dummy-key',
});

// Defines the tools the agent can use
export const agentTools = [
  {
    type: 'function',
    function: {
      name: 'navigate_to',
      description: 'Navigates the user to a specific page on the website. Use this when the user asks to go to a page like Contact, Portfolio, Chat, Weather, Merch, etc.',
      parameters: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: "The path to navigate to, e.g., '/', '/contact', '/portfolio', '/weather', '/merch', '/try-os', '/comments', '/color-picker', '/chat', '/talking-elon', '/editor', '/explore'"
          }
        },
        required: ['path']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'play_music',
      description: 'Interact with the music player on the website if the user asks for music.',
      parameters: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['play', 'pause'],
            description: "Whether to play or pause the music"
          }
        },
        required: ['action']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'talk_to_elon',
      description: 'Send a message to Elon on the Talking Elon page. Use this when the user wants to ask Elon a question.',
      parameters: {
        type: 'object',
        properties: {
          text: {
            type: 'string',
            description: "The question or message to ask Elon."
          }
        },
        required: ['text']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'explore_country',
      description: 'Navigate the 3D globe to a specific country on the Explore page to discover its music and culture.',
      parameters: {
        type: 'object',
        properties: {
          country: {
            type: 'string',
            description: "The name of the country to explore on the globe."
          }
        },
        required: ['country']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'contact_submit',
      description: 'Navigates to Contact page and fills out the contact form.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
          message: { type: 'string' }
        },
        required: ['name', 'email', 'message']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'add_to_cart',
      description: 'Navigates to Merch page and adds an item to the shopping cart.',
      parameters: {
        type: 'object',
        properties: {
          product_name: { type: 'string', description: 'Name of the product to add' }
        },
        required: ['product_name']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'post_comment',
      description: 'Navigates to Comments page and posts a comment.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          content: { type: 'string' }
        },
        required: ['name', 'content']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'pick_color',
      description: 'Navigates to Color Picker page and selects a specific hex color.',
      parameters: {
        type: 'object',
        properties: {
          hex_color: { type: 'string', description: 'Hex code of the color e.g. #ff0000' }
        },
        required: ['hex_color']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'set_video_persona',
      description: 'Navigates to Video Editor and selects a voice persona for the video. (elon, attenborough, taylor, morgan)',
      parameters: {
        type: 'object',
        properties: {
          persona_id: { type: 'string' }
        },
        required: ['persona_id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_weather',
      description: 'Navigates to the Weather page to show the current local weather based on location.',
      parameters: {
        type: 'object',
        properties: {},
        required: []
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'try_os',
      description: 'Navigates to the TryOS page to boot into the virtual operating system.',
      parameters: {
        type: 'object',
        properties: {},
        required: []
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'play_tictactoe',
      description: 'Navigates to the Portfolio page and plays a move in Tic Tac Toe.',
      parameters: {
        type: 'object',
        properties: {
          move: { type: 'string', description: 'The square index 0-8 to play, or "reset" to restart the game.' }
        },
        required: ['move']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'calculate_math',
      description: 'Navigates to the Portfolio page and uses the calculator to solve a math expression.',
      parameters: {
        type: 'object',
        properties: {
          expression: { type: 'string', description: 'The math expression to evaluate, e.g. "7+5*2"' }
        },
        required: ['expression']
      }
    }
  }
];

export const getAgentResponse = async (messages) => {
  if (!apiKey) {
    return { error: 'Please set VITE_CEREBRAS_API_KEY in your .env file.' };
  }

  try {
    const response = await cerebrasClient.chat.completions.create({
      model: 'llama3.1-8b', // Typical model available on Cerebras inference
      messages: [
        { role: 'system', content: `You are an AI assistant built into the user's portfolio website. You can help them navigate the site or answer questions. If they ask you to perform an action on the site, use the available tools.` },
        ...messages
      ],
      tools: agentTools,
      tool_choice: 'auto'
    });

    return response.choices[0].message;
  } catch (error) {
    console.error('Error in getAgentResponse:', error);
    return { error: error.message };
  }
};

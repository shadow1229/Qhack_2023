import json
import pennylane as qml
import pennylane.numpy as np

def is_product(state, subsystem, wires):
    """Determines if a pure quantum state can be written as a product state between 
    a subsystem of wires and their compliment.

    Args:
        state (numpy.array): The quantum state of interest.
        subsystem (list(int)): The subsystem used to determine if the state is a product state.
        wires (list(int)): The wire/qubit labels for the state. Use these for creating a QNode if you wish!

    Returns:
        (str): "yes" if the state is a product state or "no" if it isn't.
    """


    # Put your solution here #
    def state2wire (state_idx,wires):
        result = [0 for wire in wires]
        for i in range(len(wires)):
            wire = state_idx%2
            state_idx = (state_idx - wire)//2
            result[len(wires) -1 -i] = wire
        return result
        
    def wire2state (wires):
        result = 0
        for i in range(len(wires)):
            result += wires[i]*(2**(len(wires)-1-i))
        return result
    #https://pages.uoregon.edu/svanenk/solutions/Mixed_states.pdf
    #https://quantumcomputing.stackexchange.com/questions/15600/how-do-i-trace-out-the-second-qubit-to-find-the-reduced-density-operator
    density_matrix = np.outer(state, state)
    #state 00 01 10 11 
    #      00|00 x00|01  00|10 x00|11
    #     x01|00  01|01 x01|10  01|11
    #      10|00 x10|01  10|10 x10|11
    #     x11|00  11|01 x11|10  11|11
    m = np.matmul(density_matrix,density_matrix)

    #find complements, which is wires that does not exists in subsystem    
    comple = []
    for w in wires:
        if w not in subsystem:
            comple.append(w)
    tr_comple = list(np.zeros( (2**len(subsystem) , 2**len(subsystem)),dtype=float ))

    #trace over complements
    
    for i in range(density_matrix.shape[0]):
        for j in range(density_matrix.shape[1]):
            #state index to wire status , 
            #ex) state= 0, wires= [0,1] -> wire status = [0,0]
            #ex) state= 1, wires= [0,1] -> wire status = [0,1]
            #ex) state= 2, wires= [0,1] -> wire status = [1,0]
            #ex) state= 3, wires= [0,1] -> wire status = [1,1]
            wires_i = state2wire (i,wires) 
            wires_j = state2wire (j,wires) 

            w_dict_i = {}
            w_dict_j = {}
            
            for w in range(len(wires_i)):
                w_dict_i[w] = wires_i[w]
            for w in range(len(wires_j)):
                w_dict_j[w] = wires_j[w]                
            
            wires_i_sub  = np.array([w_dict_i[w] for w in subsystem]) 
            wires_i_com  = np.array([w_dict_i[w] for w in comple])
            wires_j_sub  = np.array([w_dict_j[w] for w in subsystem]) 
            wires_j_com  = np.array([w_dict_j[w] for w in comple])
            new_i = wire2state(wires_i_sub)
            new_j = wire2state(wires_j_sub)
            if (wires_i_com == wires_j_com).all(): #because i want to get "Trace"
                tr_comple[new_i][new_j] = tr_comple[new_i][new_j]  +  density_matrix[i][j]

    tr = np.trace(np.matmul(tr_comple,tr_comple))
    tol = 1e-4 #just in case of floating error
    if tr < (1 - tol): 
        print('no')
        return 'no'
    else:
        print('yes')
        return 'yes'

# These functions are responsible for testing the solution.
def run(test_case_input: str) -> str:
    ins = json.loads(test_case_input)
    state, subsystem, wires = ins
    state = np.array(state)
    output = is_product(state, subsystem, wires)
    return output

def check(solution_output: str, expected_output: str) -> None:
    assert solution_output == expected_output

test_cases = [['[[0.707107, 0, 0, 0.707107], [0], [0, 1]]', 'no'], ['[[1, 0, 0, 0], [0], [0, 1]]', 'yes']]

for i, (input_, expected_output) in enumerate(test_cases):
    print(f"Running test case {i} with input '{input_}'...")

    try:
        output = run(input_)

    except Exception as exc:
        print(f"Runtime Error. {exc}")

    else:
        if message := check(output, expected_output):
            print(f"Wrong Answer. Have: '{output}'. Want: '{expected_output}'.")

        else:
            print("Correct!")

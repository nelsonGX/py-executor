import subprocess
import tempfile
import os

def execute_code(code_string, timeout=10):
    """
    Execute Python code using subprocess and return the result.
    
    Args:
        code_string (str): Python code to execute
        timeout (int): Maximum execution time in seconds
        
    Returns:
        dict: Contains 'stdout', 'stderr', 'returncode', and 'success' keys
    """
    # Create a temporary file to store the code
    with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as temp_file:
        temp_file.write(code_string)
        temp_file_path = temp_file.name
    
    try:
        # Execute the Python file using subprocess
        result = subprocess.run(
            ['python', temp_file_path],
            capture_output=True,
            text=True,
            timeout=timeout
        )
        
        return {
            'stdout': result.stdout,
            'stderr': result.stderr,
            'returncode': result.returncode,
            'success': result.returncode == 0,
            'timed_out': False
        }
        
    except subprocess.TimeoutExpired:
        return {
            'stdout': '',
            'stderr': f'Code execution timed out after {timeout} seconds',
            'returncode': -1,
            'success': False,
            'timed_out': True
        }
        
    except Exception as e:
        return {
            'stdout': '',
            'stderr': str(e),
            'returncode': -1,
            'success': False,
            'timed_out': False
        }
        
    finally:
        # Clean up the temporary file
        try:
            os.unlink(temp_file_path)
        except:
            pass